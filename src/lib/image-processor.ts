export interface ProcessedImage {
  fileName: string;
  dataUrl: string;
  width: number;
  height: number;
  originalFileIndex: number;
}

export type ProcessedImageSet = {
  originalFileName: string;
  originalFiles: File[];
  images: ProcessedImage[];
};

const TARGET_FILE_SIZE_KB = 349;
const TARGET_FILE_SIZE_BYTES = TARGET_FILE_SIZE_KB * 1024;

function getBase64ByteSize(base64String: string) {
    // Remove metadata
    const base64 = base64String.split(',')[1];
    if (!base64) return 0;
    // Calculate the size
    const padding = (base64.match(/=/g) || []).length;
    return base64.length * 0.75 - padding;
}

async function getSizedDataUrl(canvas: HTMLCanvasElement): Promise<string> {
    let quality = 0.95;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    let size = getBase64ByteSize(dataUrl);

    // Iteratively reduce quality to meet size requirement
    while (size > TARGET_FILE_SIZE_BYTES && quality > 0.1) {
        quality -= 0.05;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        size = getBase64ByteSize(dataUrl);
    }
    
    // If it's a png, try to convert to jpeg to reduce size
    if (dataUrl.startsWith('data:image/png')) {
        const jpegUrl = canvas.toDataURL('image/jpeg', 0.9);
        if (getBase64ByteSize(jpegUrl) < size) {
            return getSizedDataUrl(canvas); // re-run with jpeg logic
        }
    }

    return dataUrl;
}


export async function createImageTask(file: File, width: number, height: number, originalFileIndex: number): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));
        
        if (width === 1300 && height === 2000) {
            // Intelligent crop logic for 1300x2000
            const targetAspectRatio = width / height;
            const imageAspectRatio = img.width / img.height;
            
            let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;

            if (imageAspectRatio > targetAspectRatio) {
                // Image is wider than target, crop horizontally
                sourceWidth = img.height * targetAspectRatio;
                sourceX = (img.width - sourceWidth) / 2;
            } else {
                // Image is taller than target, crop vertically
                sourceHeight = img.width / targetAspectRatio;
                sourceY = (img.height - sourceHeight) / 2;
            }
            ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);

        } else {
            // Blurred background logic for other sizes (e.g., 2000x2000)
            ctx.filter = 'blur(24px)';
            const bgScale = Math.max(width / img.width, height / img.height);
            const bgX = (width - img.width * bgScale) / 2;
            const bgY = (height - img.height * bgScale) / 2;
            ctx.drawImage(img, bgX, bgY, img.width * bgScale, img.height * bgScale);
            ctx.filter = 'none';

            // Draw centered image
            const fgScale = Math.min(width / img.width, height / img.height);
            const fgX = (width - img.width * fgScale) / 2;
            const fgY = (height - img.height * fgScale) / 2;
            ctx.drawImage(img, fgX, fgY, img.width * fgScale, img.height * fgScale);
        }

        const dataUrl = await getSizedDataUrl(canvas);
        const fileExtension = dataUrl.startsWith('data:image/jpeg') ? 'jpg' : 'png';
        
        resolve({ fileName: `processed_${width}x${height}_${file.name.replace(/\.[^/.]+$/, "")}.${fileExtension}`, dataUrl, width, height, originalFileIndex });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function processImages(
  files: File[], 
  dimensions: { width: number; height: number }[]
): Promise<ProcessedImageSet[]> {
    const allProcessedTasks = files.map(async (file, index) => {
        const processingTasks = dimensions.map(dim => createImageTask(file, dim.width, dim.height, index));
        const processedImages = await Promise.all(processingTasks);
        return {
            originalFileName: file.name,
            originalFiles: [file],
            images: processedImages,
        };
    });

    return Promise.all(allProcessedTasks);
}

export async function getCompressedImageUris(files: File[]): Promise<string[]> {
    const compressedImageTasks = files.map(file => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_DIM = 512;
                    const scale = Math.min(MAX_DIM / img.width, MAX_DIM / img.height);
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject(new Error('Could not get canvas context'));
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    resolve(dataUrl);
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });

    return Promise.all(compressedImageTasks);
}
