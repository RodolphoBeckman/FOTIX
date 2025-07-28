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

export async function createImageTask(file: File, width: number, height: number, originalFileIndex: number): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));
        
        // Draw blurred background
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

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve({ fileName: `processed_${width}x${height}_${file.name}`, dataUrl, width, height, originalFileIndex });
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
