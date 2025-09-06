import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image-preview",
    })

    const fullPrompt = `
    Generate a photorealistic scene based on this description: "${prompt}".

    CRITICAL OBJECT INTEGRATION REQUIREMENTS:
    You must place the provided transparent object (file.png) naturally and seamlessly into the scene. 

    WHAT YOU MUST PRESERVE:
    - The object's exact shape, colors, proportions, and details (pixel-perfect)
    - All original textures and materials of the object
    - The object's structural integrity and design

    WHAT YOU MAY ADJUST FOR NATURAL INTEGRATION:
    - Position the object logically within the scene (on surfaces, in appropriate locations)
    - Scale the object to fit naturally (closer/further perspective)
    - Rotate or angle the object in 3D space for realistic placement
    - Apply scene-appropriate lighting effects:
      * Cast realistic shadows beneath and around the object
      * Reflect the scene's ambient lighting on the object's surfaces
      * Apply environmental reflections if the object has reflective surfaces
      * Match the color temperature of the scene lighting
    - Add atmospheric effects that affect the object:
      * Fog, mist, or haze that would naturally surround the object
      * Dust particles or environmental elements that would interact with it
      * Depth of field effects for photographic realism

    ENVIRONMENTAL HARMONY:
    - Make the object appear as if it truly belongs in this environment
    - Ensure the lighting direction and intensity matches the scene
    - Create believable surface interactions (object resting on ground, table, etc.)
    - Apply appropriate weathering or environmental effects if the scene suggests it
    - Ensure the object casts and receives shadows naturally

    FORBIDDEN CONTENT:
    Do not add humans, body parts, text, writing, celebrities, political elements, violence, or inappropriate content.

    Create a masterpiece where the object feels like it was always part of this scene.
    `

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
    
    const result = await model.generateContent([fullPrompt, objectImage])
    const response = await result.response

    const imagePart = response.candidates[0]?.content?.parts?.find(
      (p) => p.inlineData
    )

    if (!imagePart) {
      throw new Error('No image returned from Gemini')
    }

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
    return Response.json({ 
      error: 'Failed to generate image',
      details: error.message 
    }, { status: 500 })
  }
}
