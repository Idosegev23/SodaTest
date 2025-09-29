import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

const apiKey = process.env.GEMINI_API_KEY
console.log('Gemini API Key exists:', !!apiKey)
console.log('Gemini API Key prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'undefined')

const genAI = new GoogleGenerativeAI(apiKey)

// Safety settings for content generation - more lenient for creative content
const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_ONLY_HIGH',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
]

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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro-image-preview", 
      safetySettings,
      generationConfig: {
        temperature: 0.8,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
        candidateCount: 1
      }
    })
    
    console.log('✅ Using Gemini 2.5 Pro model: gemini-2.5-pro-image-preview for image generation')
    console.log('🔧 Configuration: Most advanced Gemini model with enhanced image capabilities')

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

    console.log('Generating image with Gemini...')
    
    // Generate content using the new API format (per latest documentation)
    const result = await model.generateContent([
      fullPrompt,
      objectImage
    ])
    
    const response = await result.response
    
    // Enhanced logging for debugging
    console.log('Gemini API response status:', response.candidates?.length || 0, 'candidates')
    console.log('Full response:', JSON.stringify({
      candidates: response.candidates?.length || 0,
      safetyRatings: response.candidates?.[0]?.safetyRatings || 'none'
    }, null, 2))
    
    // Better error handling with safety ratings check
    if (!response.candidates || response.candidates.length === 0) {
      console.error('No candidates returned from Gemini API')
      console.error('This might be due to safety filters or prompt issues')
      throw new Error('No candidates returned - content may have been filtered by safety settings')
    }

    const candidate = response.candidates[0]
    if (!candidate.content || !candidate.content.parts) {
      console.error('Invalid candidate structure:', JSON.stringify(candidate, null, 2))
      throw new Error('Invalid response structure from Gemini API')
    }

    const imagePart = candidate.content.parts.find(part => part.inlineData)

    if (!imagePart || !imagePart.inlineData) {
      console.error('No image data found in response parts')
      console.error('Available parts:', candidate.content.parts.map(p => Object.keys(p)))
      throw new Error('No image returned from Gemini API')
    }

    console.log('Successfully received image from Gemini, size:', imagePart.inlineData.data.length, 'characters')
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
    
    // Enhanced error handling based on Gemini documentation
    let errorMessage = 'Failed to generate image'
    let statusCode = 500
    
    if (error.message?.includes('API key')) {
      errorMessage = 'API configuration error'
      statusCode = 500
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
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }, { status: statusCode })
  }
}
