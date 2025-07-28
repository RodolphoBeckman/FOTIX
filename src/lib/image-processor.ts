export interface ProcessedImage {
  fileName: string;
  dataUrl: string;
  width: number;
  height: number;
}

export type ProcessedImageSet = {
  originalFileName: string;
  images: ProcessedImage[];
};

async function createImageTask(file: File, width: number, height: number): Promise<ProcessedImage> {
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
        
        const scale = Math.min(width / img.width, height / img.height);
        const x = (width - img.width * scale) / 2;
        const y = (height - img.height * scale) / 2;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve({ fileName: `processed_${width}x${height}_${file.name}`, dataUrl, width, height });
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
    const allProcessedTasks = files.map(async (file) => {
        const processingTasks = dimensions.map(dim => createImageTask(file, dim.width, dim.height));
        const processedImages = await Promise.all(processingTasks);
        return {
            originalFileName: file.name,
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
