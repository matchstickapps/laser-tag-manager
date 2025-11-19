/**
 * Google Cloud Vision API OCR Processor
 * Sends images to Cloud Vision API for fast, accurate text extraction
 */

import axios from 'axios';

/**
 * Send image to Google Cloud Vision API for text detection
 * @param {string} base64Image - Base64 encoded image (with or without data URL prefix)
 * @param {string} apiKey - Google Cloud Vision API key
 * @returns {Promise<Object>} OCR result with text and confidence
 */
export const detectTextWithCloudVision = async (base64Image, apiKey) => {
  try {
    // Remove data URL prefix if present
    const imageContent = base64Image.includes('base64,')
      ? base64Image.split('base64,')[1]
      : base64Image;

    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

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
            languageHints: ['en'] // English text
          }
        }
      ]
    };

    console.log('Sending image to Cloud Vision API...');
    const startTime = Date.now();

    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    const endTime = Date.now();
    console.log(`Cloud Vision API response received in ${endTime - startTime}ms`);

    if (!response.data.responses || !response.data.responses[0]) {
      throw new Error('Invalid response from Cloud Vision API');
    }

    const result = response.data.responses[0];

    // Check for errors
    if (result.error) {
      throw new Error(result.error.message || 'Cloud Vision API error');
    }

    // Extract text annotations
    const textAnnotations = result.textAnnotations || [];

    if (textAnnotations.length === 0) {
      return {
        text: '',
        confidence: 0,
        rawResponse: result
      };
    }

    // First annotation contains full text
    const fullText = textAnnotations[0].description || '';

    // Calculate average confidence from individual words
    let totalConfidence = 0;
    let confidenceCount = 0;

    if (textAnnotations.length > 1) {
      // Skip first annotation (full text), use individual words
      for (let i = 1; i < textAnnotations.length; i++) {
        if (textAnnotations[i].confidence !== undefined) {
          totalConfidence += textAnnotations[i].confidence;
          confidenceCount++;
        }
      }
    }

    const averageConfidence = confidenceCount > 0
      ? totalConfidence / confidenceCount
      : 0.95; // Cloud Vision is typically very confident

    console.log('Extracted text:', fullText);
    console.log('Average confidence:', averageConfidence);

    return {
      text: fullText,
      confidence: averageConfidence,
      rawResponse: result
    };

  } catch (error) {
    console.error('Cloud Vision API error:', error);

    // Provide helpful error messages
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.message;

      if (status === 400) {
        throw new Error('Invalid image format. Please try capturing again.');
      } else if (status === 403) {
        throw new Error('API key is invalid or Vision API is not enabled.');
      } else if (status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Cloud Vision API error: ${message}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your internet connection.');
    } else {
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }
};

/**
 * Process image with Cloud Vision (simplified pipeline)
 * @param {HTMLCanvasElement} canvas - Canvas with captured image
 * @param {string} apiKey - Google Cloud Vision API key
 * @param {Function} onProgress - Progress callback (0-1)
 * @returns {Promise<Object>} Processed result
 */
export const processImageWithCloudVision = async (canvas, apiKey, onProgress = () => {}) => {
  try {
    onProgress(0.1);

    // Convert canvas to base64 (JPEG for smaller size)
    const base64Image = canvas.toDataURL('image/jpeg', 0.9);

    onProgress(0.3);

    // Send to Cloud Vision
    const result = await detectTextWithCloudVision(base64Image, apiKey);

    onProgress(1.0);

    return {
      text: result.text,
      confidence: result.confidence,
      rawResponse: result.rawResponse
    };

  } catch (error) {
    console.error('Image processing failed:', error);
    throw error;
  }
};

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if format appears valid
 */
export const isValidApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Google Cloud API keys are typically 39 characters starting with "AIza"
  return apiKey.startsWith('AIza') && apiKey.length === 39;
};

/**
 * Get API key from environment or localStorage
 * @returns {string|null} API key or null if not found
 */
export const getApiKey = () => {
  // First check import.meta.env (Vite environment variables)
  const envKey = import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY;
  if (envKey) {
    return envKey;
  }

  // Fallback to localStorage (user can enter manually)
  const storedKey = localStorage.getItem('googleCloudVisionApiKey');
  if (storedKey) {
    return storedKey;
  }

  return null;
};

/**
 * Save API key to localStorage
 * @param {string} apiKey - API key to save
 */
export const saveApiKey = (apiKey) => {
  localStorage.setItem('googleCloudVisionApiKey', apiKey);
};

/**
 * Clear stored API key
 */
export const clearApiKey = () => {
  localStorage.removeItem('googleCloudVisionApiKey');
};
