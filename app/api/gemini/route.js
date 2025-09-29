import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

const apiKey = process.env.GEMINI_API_KEY
console.log('Gemini API Key exists:', !!apiKey)
console.log('Gemini API Key prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'undefined')

const genAI = new GoogleGenerativeAI(apiKey)

// Safety settings for content generation
const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
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
      model: "gemini-2.5-flash-image-preview", 
      safetySettings,
    })
    
    console.log('✅ Using Gemini model: gemini-2.5-flash-image-preview for image generation')
    console.log('🔧 Configuration: Text-to-Image + Image Editing capabilities enabled')

    const fullPrompt = `Create a photorealistic scene showing ${prompt}. 

In this scene, naturally integrate the SodaStream ENSŌ device provided in the image, ensuring it feels like it belongs there organically.

SCENE REQUIREMENTS:
- Create a vivid, detailed photorealistic environment based on the description
- Use professional photography techniques: proper depth of field, realistic lighting, and atmospheric perspective
- Apply cinematic composition with attention to foreground, midground, and background elements

OBJECT INTEGRATION:
- Position the SodaStream ENSŌ device naturally within the scene context
- Preserve the device's exact design, colors, and proportions
- Apply scene-appropriate lighting that matches the environment's mood and time of day
- Create realistic shadows and reflections that ground the object in the scene
- Scale and orient the device appropriately for the scene's perspective

LIGHTING & ATMOSPHERE:
- Match lighting direction and intensity across the entire composition  
- Apply environmental effects like ambient occlusion, subsurface scattering if appropriate
- Create atmospheric depth with subtle fog, haze, or particles if they enhance the scene
- Use color temperature that supports the scene's mood and setting

PHOTOGRAPHIC QUALITY:
- Captured with professional camera settings, emphasizing sharp focus on key elements
- Natural color grading that enhances the scene without over-saturation
- Subtle film grain or digital noise that adds to photographic authenticity
- Balanced exposure with proper highlight and shadow detail

STRICT CONTENT GUIDELINES:
No humans, people, body parts, faces, text, writing, logos, celebrities, political content, violence, or inappropriate material.

The final image should look like a professional product photograph where the ENSŌ device has been naturally placed in this beautiful environment.`

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
    
    // Better error handling
    if (!response.candidates || response.candidates.length === 0) {
      console.error('No candidates returned from Gemini API')
      throw new Error('No candidates returned from Gemini API')
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
