'use client';

import * as React from 'react';
import { Upload, FileText, ImageIcon, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { processImages, ProcessedImageSet } from '@/lib/image-processor';
import { ProcessedImagesDisplay } from '@/components/processed-images-display';
import { formatBytes } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import Image from 'next/image';

type ProcessingMode = 'group' | 'individual';

interface FileWithPreview extends File {
    preview: string;
}

export default function ImageEditorPage() {
  const [files, setFiles] = React.useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processedSets, setProcessedSets] = React.useState<ProcessedImageSet[]>([]);
  const [processingMode, setProcessingMode] = React.useState<ProcessingMode>('group');
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: File[]) => {
      const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        const filesWithPreview: FileWithPreview[] = imageFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setFiles(prevFiles => [...prevFiles, ...filesWithPreview]);
      } else {
        toast({
          variant: 'destructive',
          title: 'Tipo de Arquivo Inválido',
          description: 'Por favor, envie apenas arquivos de imagem.',
        });
      }
  };

  const handleFileChange = (newFiles: FileList | null) => {
    if (newFiles) {
      addFiles(Array.from(newFiles));
    }
  };
  
  React.useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (items) {
        const pastedFiles: File[] = [];
        for (let i = 0; i < items.length; i++) {
          if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
            const file = items[i].getAsFile();
            if(file) {
              pastedFiles.push(file);
            }
          }
        }
        if (pastedFiles.length > 0) {
          addFiles(pastedFiles);
        }
      }
    };

    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const fileToRemove = files[index];
    if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
    }
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
      // Initially process only for the website format
      const dimensions = [{ width: 1300, height: 2000 }];
      const results = await processImages(files, dimensions);

      if (processingMode === 'group') {
          const allProcessedImages = results.flatMap(set => set.images);
          const groupSet: ProcessedImageSet = {
              originalFileName: 'Grupo de Produtos',
              originalFiles: files,
              images: allProcessedImages,
          };
          setProcessedSets([groupSet]);
      } else {
          setProcessedSets(results.map((set, index) => ({
              ...set,
              originalFiles: [files[index]]
          })));
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
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setProcessedSets([]);
    setIsProcessing(false);
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-7xl">
        {processedSets.length === 0 ? (
          <div className="space-y-6 max-w-5xl mx-auto">
            <Card
              onDragEnter={handleDragEvents}
              onDragOver={handleDragEvents}
              onDragLeave={handleDragEvents}
              onDrop={handleDrop}
              className={`transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border'}`}
            >
              <CardContent className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50" onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-semibold">Arraste e solte, cole, ou clique para selecionar</p>
                <p className="text-sm text-muted-foreground">Suporta: JPG, PNG, WEBP</p>
              </CardContent>
            </Card>
            
            {files.length > 0 && (
              <Card>
                 <CardHeader>
                    <CardTitle>Arquivos em Fila</CardTitle>
                 </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {files.map((file, index) => (
                      <div key={index} className="relative group aspect-square">
                        <Image src={file.preview} alt={file.name} fill className="object-cover rounded-md border" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeFile(index)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate rounded-b-md">
                            {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
                    <div>
                      <Label className="font-medium">Modo de Processamento</Label>
                      <Tabs
                        value={processingMode}
                        onValueChange={(value) => setProcessingMode(value as ProcessingMode)}
                        className="mt-2"
                      >
                        <TabsList>
                          <TabsTrigger value="group">
                            Grupo (todas as imagens para um produto)
                          </TabsTrigger>
                          <TabsTrigger value="individual">
                            Individual (cada imagem é um produto)
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
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
                        isGroup={processingMode === 'group'}
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
