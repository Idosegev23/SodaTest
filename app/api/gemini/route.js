import { GoogleGenAI } from '@google/genai'
import fs from 'fs'
import path from 'path'

const apiKey = process.env.GEMINI_API_KEY
console.log('Gemini API Key exists:', !!apiKey)
console.log('Gemini API Key prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'undefined')

const genAI = new GoogleGenAI({ apiKey })

export async function POST(request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set!')
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    // Using Gemini 2.0 Flash Experimental - verified working model
    const modelName = "gemini-2.0-flash-exp"
    
    console.log(`✅ Using Gemini model: ${modelName} for image generation`)
    console.log('🔧 Configuration: Experimental image generation with new @google/genai SDK')

    const fullPrompt = `A high-resolution, studio-quality photorealistic image of ${prompt}. 

In this scene, naturally integrate the SodaStream ENSŌ device provided in the reference image, positioning it as a hero product within the environment.

PHOTOGRAPHIC SPECIFICATIONS:
- Shot with professional camera equipment (full-frame DSLR, 85mm lens)
- Perfect exposure with balanced highlights and shadows
- Crisp focus on the ENSŌ device with natural depth of field
- Professional three-point lighting setup creating dimensional depth

SCENE COMPOSITION:
- The SodaStream ENSŌ device as the focal point, naturally integrated into the scene
- Maintain exact device proportions, colors, and design details
- Realistic environmental lighting that enhances both the device and surroundings
- Natural shadows and reflections that ground the product authentically

VISUAL QUALITY:
- Ultra-realistic textures and materials
- Accurate color reproduction with natural saturation
- Professional product photography aesthetics
- Clean, commercial-grade image suitable for premium branding

LIGHTING & ATMOSPHERE:
- Soft, even lighting that flatters the product
- Environmental lighting that matches the scene's natural conditions
- Subtle atmospheric effects that enhance mood without distraction
- Color temperature optimized for the described environment

CONTENT RESTRICTIONS:
Absolutely no people, faces, human figures, text, writing, logos, or inappropriate content.

Create a premium product photograph where the ENSŌ device appears naturally integrated into this beautiful setting.`

    // קריאת קובץ התמונה
    const imagePath = path.join(process.cwd(), 'public', 'file.png')
    let imageBuffer
    
    try {
      imageBuffer = fs.readFileSync(imagePath)
    } catch (_error) {
      // אם הקובץ לא קיים, ניצור תמונה דמה
      console.log('File.png not found, creating placeholder')
      return Response.json({ 
        error: 'Object image not found. Please add file.png to public folder.' 
      }, { status: 500 })
    }

    const objectImage = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/png',
      },
    }

    console.log('Generating image with Gemini using new SDK...')
    
    // Build the prompt array with text and image (new SDK format)
    const promptParts = [
      { text: fullPrompt },
      objectImage
    ]
    
    // Generate content using the new @google/genai SDK
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: promptParts,
    })
    
    // Enhanced logging for debugging
    console.log('Gemini API response received')
    console.log('Candidates:', response.candidates?.length || 0)
    
    // Better error handling
    if (!response.candidates || response.candidates.length === 0) {
      console.error('No candidates returned from Gemini API')
      throw new Error('No candidates returned - content may have been filtered')
    }

    const candidate = response.candidates[0]
    if (!candidate.content || !candidate.content.parts) {
      console.error('Invalid candidate structure')
      throw new Error('Invalid response structure from Gemini API')
    }

    // Find the image part in the response
    const imagePart = candidate.content.parts.find(part => part.inlineData)

    if (!imagePart || !imagePart.inlineData) {
      console.error('No image data found in response')
      throw new Error('No image returned from Gemini API')
    }

    console.log('Successfully received image from Gemini!')
    const generatedImageBuffer = Buffer.from(imagePart.inlineData.data, 'base64')

    return new Response(generatedImageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': generatedImageBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating image:', error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    // Enhanced error handling based on Gemini documentation
    let errorMessage = 'Failed to generate image'
    let statusCode = 500
    
    // Check for specific error types
    if (error.message?.includes('API key')) {
      errorMessage = 'API configuration error'
      statusCode = 500
    } else if (error.message?.includes('404') || error.message?.includes('not found')) {
      errorMessage = 'Model not available - please check model name'
      statusCode = 404
    } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorMessage = 'Service temporarily unavailable due to high demand'
      statusCode = 429
    } else if (error.message?.includes('content policy') || error.message?.includes('safety')) {
      errorMessage = 'Content does not meet safety guidelines'
      statusCode = 400
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Request timeout - please try again'
      statusCode = 408
    }
    
    return Response.json({ 
      error: errorMessage,
      details: error.message,
      model: "gemini-2.5-flash-image-preview",
      timestamp: new Date().toISOString()
    }, { status: statusCode })
  }
}
