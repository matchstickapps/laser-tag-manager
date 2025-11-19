/**
 * Image Utilities
 * Handle image compression, manipulation, and canvas operations
 */

/**
 * Compress image to reduce storage size
 * Target: < 200KB for LocalStorage efficiency
 * @param {string} dataUrl - Original base64 data URL
 * @param {number} maxSizeKB - Maximum size in KB (default: 200)
 * @param {number} quality - Initial quality (0-1, default: 0.7)
 * @returns {Promise<string>} Compressed base64 data URL
 */
export const compressImage = async (dataUrl, maxSizeKB = 200, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate new dimensions (maintain aspect ratio)
      let { width, height } = img;
      const maxDimension = 1200; // Max width or height

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      // Try compression with decreasing quality
      let compressed = canvas.toDataURL('image/jpeg', quality);
      let currentQuality = quality;

      // Reduce quality until size is acceptable
      while (getBase64Size(compressed) > maxSizeKB * 1024 && currentQuality > 0.1) {
        currentQuality -= 0.1;
        compressed = canvas.toDataURL('image/jpeg', currentQuality);
      }

      resolve(compressed);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
};

/**
 * Get size of base64 string in bytes
 * @param {string} base64 - Base64 string
 * @returns {number} Size in bytes
 */
export const getBase64Size = (base64) => {
  const stringLength = base64.length - 'data:image/png;base64,'.length;
  const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
  return sizeInBytes;
};

/**
 * Capture image from video element
 * @param {HTMLVideoElement} videoElement - Video element
 * @returns {HTMLCanvasElement} Canvas with captured frame
 */
export const captureFromVideo = (videoElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);

  return canvas;
};

/**
 * Convert canvas to blob
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} type - MIME type (default: 'image/png')
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<Blob>} Image blob
 */
export const canvasToBlob = (canvas, type = 'image/png', quality = 0.9) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      type,
      quality
    );
  });
};

/**
 * Resize canvas while maintaining aspect ratio
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {HTMLCanvasElement} Resized canvas
 */
export const resizeCanvas = (sourceCanvas, maxWidth, maxHeight) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let { width, height } = sourceCanvas;

  // Calculate new dimensions
  if (width > maxWidth) {
    height = (height / width) * maxWidth;
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = (width / height) * maxHeight;
    height = maxHeight;
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(sourceCanvas, 0, 0, width, height);

  return canvas;
};

/**
 * Detect if image contains mostly dark or light content
 * Useful for determining if preprocessing is needed
 * @param {HTMLCanvasElement} canvas - Canvas to analyze
 * @returns {Object} { isDark: boolean, averageBrightness: number }
 */
export const analyzeImageBrightness = (canvas) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let totalBrightness = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    totalBrightness += brightness;
  }

  const averageBrightness = totalBrightness / pixelCount;
  const isDark = averageBrightness < 128;

  return {
    isDark,
    averageBrightness
  };
};

/**
 * Crop canvas to remove borders/padding
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {number} borderPercent - Border to remove (0-1)
 * @returns {HTMLCanvasElement} Cropped canvas
 */
export const cropCanvas = (sourceCanvas, borderPercent = 0.1) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const borderX = sourceCanvas.width * borderPercent;
  const borderY = sourceCanvas.height * borderPercent;

  const newWidth = sourceCanvas.width - (borderX * 2);
  const newHeight = sourceCanvas.height - (borderY * 2);

  canvas.width = newWidth;
  canvas.height = newHeight;

  ctx.drawImage(
    sourceCanvas,
    borderX, borderY, newWidth, newHeight,
    0, 0, newWidth, newHeight
  );

  return canvas;
};

/**
 * Apply rotation to canvas
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {number} degrees - Rotation in degrees
 * @returns {HTMLCanvasElement} Rotated canvas
 */
export const rotateCanvas = (sourceCanvas, degrees) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const radians = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  canvas.width = sourceCanvas.width * cos + sourceCanvas.height * sin;
  canvas.height = sourceCanvas.width * sin + sourceCanvas.height * cos;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);

  return canvas;
};
