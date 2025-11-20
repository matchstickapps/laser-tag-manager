/**
 * OCR Client
 * Client-side utility for calling the Next.js OCR API
 */

/**
 * Process image with OCR via Next.js API route
 * @param {string} base64Image - Base64 encoded image (with or without data URL prefix)
 * @param {Function} onProgress - Progress callback (0-1)
 * @returns {Promise<Object>} OCR result with text and confidence
 */
export const processImageWithOCR = async (base64Image, onProgress = () => {}) => {
  try {
    onProgress(0.1)

    // Call the Next.js API route
    const response = await fetch('/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    })

    onProgress(0.8)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'OCR processing failed')
    }

    const result = await response.json()

    onProgress(1.0)

    return {
      text: result.text,
      confidence: result.confidence,
    }

  } catch (error) {
    console.error('OCR processing failed:', error)
    throw error
  }
}

/**
 * Process canvas image with OCR
 * @param {HTMLCanvasElement} canvas - Canvas with captured image
 * @param {Function} onProgress - Progress callback (0-1)
 * @returns {Promise<Object>} Processed result
 */
export const processCanvasWithOCR = async (canvas, onProgress = () => {}) => {
  try {
    onProgress(0.1)

    // Convert canvas to base64 (JPEG for smaller size)
    const base64Image = canvas.toDataURL('image/jpeg', 0.9)

    onProgress(0.3)

    // Send to OCR API
    const result = await processImageWithOCR(base64Image, (progress) => {
      // Scale progress from 0.3 to 1.0
      onProgress(0.3 + (progress * 0.7))
    })

    return result

  } catch (error) {
    console.error('Image processing failed:', error)
    throw error
  }
}
