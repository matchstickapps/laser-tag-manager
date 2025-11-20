import { NextResponse } from 'next/server'

/**
 * POST /api/ocr
 * Process image with Google Cloud Vision OCR
 */
export async function POST(request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Cloud Vision API key not configured' },
        { status: 500 }
      )
    }

    // Remove data URL prefix if present
    const imageContent = image.includes('base64,')
      ? image.split('base64,')[1]
      : image

    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`

    const requestBody = {
      requests: [
        {
          image: {
            content: imageContent
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1
            }
          ],
          imageContext: {
            languageHints: ['en']
          }
        }
      ]
    }

    console.log('Sending image to Cloud Vision API...')
    const startTime = Date.now()

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    const endTime = Date.now()
    console.log(`Cloud Vision API response received in ${endTime - startTime}ms`)

    if (!response.ok) {
      const errorData = await response.json()
      const status = response.status
      const message = errorData.error?.message || 'Unknown error'

      if (status === 400) {
        return NextResponse.json(
          { error: 'Invalid image format. Please try capturing again.' },
          { status: 400 }
        )
      } else if (status === 403) {
        return NextResponse.json(
          { error: 'API key is invalid or Vision API is not enabled.' },
          { status: 403 }
        )
      } else if (status === 429) {
        return NextResponse.json(
          { error: 'API rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      } else {
        return NextResponse.json(
          { error: `Cloud Vision API error: ${message}` },
          { status }
        )
      }
    }

    const data = await response.json()

    if (!data.responses || !data.responses[0]) {
      return NextResponse.json(
        { error: 'Invalid response from Cloud Vision API' },
        { status: 500 }
      )
    }

    const result = data.responses[0]

    // Check for errors in the response
    if (result.error) {
      return NextResponse.json(
        { error: result.error.message || 'Cloud Vision API error' },
        { status: 500 }
      )
    }

    // Extract text annotations
    const textAnnotations = result.textAnnotations || []

    if (textAnnotations.length === 0) {
      return NextResponse.json({
        text: '',
        confidence: 0
      })
    }

    // First annotation contains full text
    const fullText = textAnnotations[0].description || ''

    // Calculate average confidence from individual words
    let totalConfidence = 0
    let confidenceCount = 0

    if (textAnnotations.length > 1) {
      // Skip first annotation (full text), use individual words
      for (let i = 1; i < textAnnotations.length; i++) {
        if (textAnnotations[i].confidence !== undefined) {
          totalConfidence += textAnnotations[i].confidence
          confidenceCount++
        }
      }
    }

    const averageConfidence = confidenceCount > 0
      ? totalConfidence / confidenceCount
      : 0.95 // Cloud Vision is typically very confident

    console.log('Extracted text:', fullText)
    console.log('Average confidence:', averageConfidence)

    return NextResponse.json({
      text: fullText,
      confidence: averageConfidence
    })

  } catch (error) {
    console.error('OCR processing error:', error)
    return NextResponse.json(
      { error: `Failed to process image: ${error.message}` },
      { status: 500 }
    )
  }
}
