import imageCompression from 'browser-image-compression';

export interface ImageProcessingOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
  watermark?: {
    text: string;
    opacity?: number;
    fontSize?: number;
    color?: string;
  };
}

const defaultOptions: ImageProcessingOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  quality: 0.8
};

export async function processImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<{ url: string; file: File }> {
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Komprimierung
  const compressedFile = await imageCompression(file, {
    maxSizeMB: mergedOptions.maxSizeMB,
    maxWidthOrHeight: mergedOptions.maxWidthOrHeight,
    useWebWorker: mergedOptions.useWebWorker,
    initialQuality: mergedOptions.quality
  });

  // Wasserzeichen hinzufügen
  if (mergedOptions.watermark) {
    const img = await createImageFromFile(compressedFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Originalbild zeichnen
    ctx.drawImage(img, 0, 0);
    
    // Wasserzeichen-Einstellungen
    const { text, opacity = 0.4, fontSize = 20, color = 'white' } = mergedOptions.watermark;
    ctx.globalAlpha = opacity;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    
    // Wasserzeichen diagonal platzieren
    const watermarkWidth = ctx.measureText(text).width;
    const angle = Math.atan2(canvas.height, canvas.width);
    const diagonal = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
    
    // Mehrere Wasserzeichen diagonal platzieren
    for (let i = 0; i < diagonal; i += watermarkWidth * 2) {
      const x = (i * Math.cos(angle)) - watermarkWidth;
      const y = (i * Math.sin(angle)) + fontSize;
      
      if (x < canvas.width && y < canvas.height) {
        ctx.fillText(text, x, y);
      }
    }
    
    // Konvertiere Canvas zurück zu File
    const dataUrl = canvas.toDataURL('image/jpeg', mergedOptions.quality);
    const watermarkedFile = dataURLtoFile(dataUrl, compressedFile.name);
    
    return {
      url: dataUrl,
      file: watermarkedFile
    };
  }

  return {
    url: await imageCompression.getDataUrlFromFile(compressedFile),
    file: compressedFile
  };
}

// Hilfsfunktionen
function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

// Qualitätsanalyse
export function analyzeImageQuality(file: File): Promise<{
  size: number;
  dimensions: { width: number; height: number };
  aspectRatio: number;
  isHighQuality: boolean;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const dimensions = {
        width: img.width,
        height: img.height
      };
      
      resolve({
        size: file.size / 1024 / 1024, // MB
        dimensions,
        aspectRatio: dimensions.width / dimensions.height,
        isHighQuality: file.size > 1024 * 1024 && // > 1MB
                      dimensions.width >= 1920 &&
                      dimensions.height >= 1080
      });
    };
    img.src = URL.createObjectURL(file);
  });
}