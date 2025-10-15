import { GoogleGenAI } from '@google/genai'
import fs from 'fs'
import path from 'path'

export async function POST(request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set!')
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    // Initialize @google/genai SDK exactly as in documentation
    const ai = new GoogleGenAI({ apiKey })

    console.log('✅ Using gemini-2.5-flash-image-preview with @google/genai SDK')
    console.log('Generating image with Gemini...')

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

STRICT CONTENT RESTRICTIONS - ABSOLUTELY CRITICAL:
The generated image must NEVER, under ANY circumstances, contain:

FORBIDDEN - HUMANS & BODY PARTS:
- Any humans, people, persons, or human-like figures
- Human silhouettes, shadows, or outlines
- ANY body parts: hands, feet, faces, heads, eyes, arms, legs, skin, hair
- Human-like cartoon characters, anime figures, or avatars
- Mannequins or human-shaped objects

FORBIDDEN - TEXT & WRITING:
- Any text, writing, letters, words, or captions in ANY language
- Typography, fonts, calligraphy, or inscriptions
- Signs, labels, or titles with readable text
- Numbers or symbols that form text

FORBIDDEN - POLITICAL & CONTROVERSIAL:
- Political symbols, flags, or emblems
- Religious symbols (crosses, stars, crescents, etc.)
- Military equipment or imagery
- Protest or demonstration imagery

FORBIDDEN - COMMERCIAL BRANDS:
- Brand logos, trademarks, or branded products
- Recognizable commercial packaging or products
- Competitor products or logos

FORBIDDEN - INAPPROPRIATE CONTENT:
- Violence, weapons, blood, or gore
- Sexual, nude, or NSFW content
- Drugs, alcohol, or cigarettes

ONLY ALLOWED IN IMAGE:
- The SodaStream ENSŌ device (as provided in reference image)
- Natural landscapes, scenery, and environments
- Animals, plants, flowers, and trees
- Abstract patterns and artistic elements
- Generic objects and decorative elements
- Natural lighting and atmospheric effects

Create a premium product photograph where ONLY the ENSŌ device and allowed natural/abstract elements appear.`

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

    // Build prompt array exactly as in documentation
    const promptArray = [
      { text: fullPrompt },
      {
        inlineData: {
          mimeType: 'image/png',
          data: imageBuffer.toString('base64'),
        },
      },
    ]

    // Generate content exactly as in documentation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: promptArray,
    })

    console.log('Gemini response received, checking structure...')
    
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error('No candidates in response')
      throw new Error('No candidates returned from Gemini API')
    }

    // Extract image from response exactly as in documentation
    let generatedImageBuffer = null
    
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log('Text in response:', part.text)
      } else if (part.inlineData) {
        const imageData = part.inlineData.data
        generatedImageBuffer = Buffer.from(imageData, 'base64')
        console.log('✅ Successfully received image from Gemini!')
      }
    }

    if (!generatedImageBuffer) {
      console.error('No image data found in response parts')
      throw new Error('No image returned from Gemini API')
    }

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
