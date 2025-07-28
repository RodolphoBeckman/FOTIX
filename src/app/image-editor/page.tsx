'use client';

import * as React from 'react';
import { Upload, FileText, ImageIcon, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { processImages, ProcessedImageSet } from '@/lib/image-processor';
import { ProcessedImagesDisplay } from '@/components/processed-images-display';
import { formatBytes } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type ProcessingMode = 'individual' | 'group';

export default function ImageEditorPage() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processedSets, setProcessedSets] = React.useState<ProcessedImageSet[]>([]);
  const [processingMode, setProcessingMode] = React.useState<ProcessingMode>('group');
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: FileList | null) => {
    if (newFiles) {
      const addedFiles = Array.from(newFiles).filter(file => file.type.startsWith('image/'));
      if (addedFiles.length > 0) {
        setFiles(prevFiles => [...prevFiles, ...addedFiles]);
      } else {
        toast({
          variant: 'destructive',
          title: 'Tipo de Arquivo Inválido',
          description: 'Por favor, envie apenas arquivos de imagem.',
        });
      }
    }
  };

  const handleDragEvents = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  const handleProcessClick = async () => {
    if (files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nenhum Arquivo',
        description: 'Por favor, envie pelo menos uma imagem para processar.',
      });
      return;
    }
    
    setIsProcessing(true);
    setProcessedSets([]);
    try {
      const dimensions = [
        { width: 2000, height: 2000 },
        { width: 1300, height: 2000 },
      ];
      const results = await processImages(files, dimensions);

      if (processingMode === 'group') {
          const allProcessedImages = results.flatMap(set => set.images);
          const uniqueImages = Array.from(new Map(allProcessedImages.map(item => [`${item.width}x${item.height}`, item])).values());
          const groupSet: ProcessedImageSet = {
              originalFileName: 'Grupo de Produtos',
              images: uniqueImages,
          };
          setProcessedSets([groupSet]);
      } else {
          setProcessedSets(results);
      }
      
    } catch (error) {
      console.error('Image processing failed:', error);
      toast({
        variant: 'destructive',
        title: 'Falha no Processamento',
        description: 'Algo deu errado ao processar as imagens.',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReset = () => {
    setFiles([]);
    setProcessedSets([]);
    setIsProcessing(false);
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-5xl">
        {processedSets.length === 0 ? (
          <div className="space-y-6">
            <Card
              onDragEnter={handleDragEvents}
              onDragOver={handleDragEvents}
              onDragLeave={handleDragEvents}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
            >
              <CardContent className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-semibold">Arraste e solte os arquivos aqui, ou clique para selecionar</p>
                <p className="text-sm text-muted-foreground">Suporta: JPG, PNG, WEBP</p>
              </CardContent>
            </Card>
            
            {files.length > 0 && (
              <Card>
                 <CardHeader>
                    <CardTitle>Arquivos em Fila</CardTitle>
                 </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          <span className="font-mono text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
                    <div>
                        <Label className="font-medium">Modo de Processamento</Label>
                        <RadioGroup defaultValue="group" value={processingMode} onValueChange={(value) => setProcessingMode(value as ProcessingMode)} className="flex items-center gap-4 mt-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="group" id="group" />
                                <Label htmlFor="group">Grupo (todas as imagens para um produto)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="individual" id="individual" />
                                <Label htmlFor="individual">Individual (cada imagem é um produto)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Button onClick={handleProcessClick} disabled={isProcessing} size="lg">
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                      Processar {files.length} Imagem{files.length > 1 ? 'ns' : ''}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="font-headline text-3xl font-bold">Resultados Processados</h2>
                    <Button variant="outline" onClick={handleReset}>Começar de Novo</Button>
                </div>
                {processedSets.map((set, index) => (
                    <ProcessedImagesDisplay 
                        key={processingMode === 'group' ? 'group-set' : set.originalFileName}
                        imageSet={set} 
                        filesForAI={processingMode === 'group' ? files : [files[index]]}
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
