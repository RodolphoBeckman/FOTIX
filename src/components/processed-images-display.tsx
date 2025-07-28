'use client';

import * as React from 'react';
import Image from 'next/image';
import { generateProductInfo, GenerateProductInfoOutput } from '@/ai/flows/generate-product-info';
import { getCompressedImageUris, createImageTask, ProcessedImageSet, ProcessedImage } from '@/lib/image-processor';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Download, Star } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

interface ProcessedImagesDisplayProps {
  imageSet: ProcessedImageSet;
  isGroup: boolean;
}

const productTypes = ["Vestido", "Camisa", "Camiseta", "Calças", "Jeans", "Shorts", "Saia", "Jaqueta", "Casaco", "Suéter", "Sapatos", "Bolsa", "Acessório"];

export function ProcessedImagesDisplay({ imageSet, isGroup }: ProcessedImagesDisplayProps) {
  const [productType, setProductType] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedContent, setGeneratedContent] = React.useState<GenerateProductInfoOutput | null>(null);
  const [favoritedImageIndex, setFavoritedImageIndex] = React.useState<number | null>(isGroup || imageSet.images.length === 1 ? 0 : null);
  const [erpImage, setErpImage] = React.useState<ProcessedImage | null>(null);
  const [isErpLoading, setIsErpLoading] = React.useState(false);

  const { toast } = useToast();

  const handleGenerateContent = async () => {
    if (!productType) {
      toast({ variant: 'destructive', title: 'Tipo de produto obrigatório' });
      return;
    }
    if (!imageSet.originalFiles || imageSet.originalFiles.length === 0) {
      toast({ variant: 'destructive', title: 'Arquivos originais não encontrados' });
      return;
    }

    setIsLoading(true);
    setGeneratedContent(null);
    try {
      // Use all original files for AI content generation in group mode
      const filesForAI = isGroup ? imageSet.originalFiles : imageSet.originalFiles;
      const imageUrls = await getCompressedImageUris(filesForAI);
      const result = await generateProductInfo({
        imageUrls,
        productType,
        productDetails: 'Item de moda moderno para loja de e-commerce.',
      });
      setGeneratedContent(result);
    } catch (error) {
      console.error('AI content generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Falha na Geração',
        description: 'Não foi possível gerar o conteúdo. Por favor, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteClick = async (index: number) => {
    if (favoritedImageIndex === index) return;
    setFavoritedImageIndex(index);
    setIsErpLoading(true);
    setErpImage(null);
    try {
        const originalFile = imageSet.originalFiles[index];
        if(!originalFile) {
             toast({ variant: 'destructive', title: 'Arquivo Original Não Encontrado' });
             return;
        }
        const result = await createImageTask(originalFile, 2000, 2000, index);
        setErpImage(result);
    } catch (error) {
        console.error('Failed to generate ERP image:', error);
        toast({ variant: 'destructive', title: 'Falha ao Gerar Imagem ERP' });
    } finally {
        setIsErpLoading(false);
    }
  };

  // Generate the first ERP image on mount for group mode or single image
  React.useEffect(() => {
    if ((isGroup || imageSet.originalFiles.length === 1) && imageSet.originalFiles.length > 0 && favoritedImageIndex !== null) {
      handleFavoriteClick(favoritedImageIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado para a área de transferência!' });
  };
  
  const handleDownload = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const websiteImages = imageSet.images.filter(img => img.width === 1300 && img.height === 2000);

  return (
    <Card className="overflow-hidden animate-in fade-in-0">
      <CardHeader>
        <CardTitle>{imageSet.originalFileName}</CardTitle>
        <CardDescription>Selecione o tipo de produto para gerar o conteúdo. Favorite uma imagem para o site para criar a versão do ERP.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className='space-y-6'>
          {/* AI Content Generation */}
          <div className="space-y-4">
              <div className="flex items-end gap-2">
                  <div className="flex-grow">
                  <Label htmlFor={`product-type-${imageSet.originalFileName}`}>Tipo de Produto</Label>
                  <Select value={productType} onValueChange={setProductType}>
                      <SelectTrigger id={`product-type-${imageSet.originalFileName}`}>
                      <SelectValue placeholder="Selecione um tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                      {productTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                  </Select>
                  </div>
                  <Button onClick={handleGenerateContent} disabled={!productType || isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Gerar
                  </Button>
              </div>
              {isLoading && (
                  <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                          <Label className="text-muted-foreground">Gerando Título...</Label>
                          <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                          <Label className="text-muted-foreground">Gerando Descrição...</Label>
                          <Skeleton className="h-24 w-full" />
                      </div>
                      <div className="space-y-2">
                          <Label className="text-muted-foreground">Gerando Tags...</Label>
                          <Skeleton className="h-10 w-full" />
                      </div>
                  </div>
              )}
              {generatedContent && (
                  <div className="space-y-4 pt-4 fade-in">
                  <div>
                      <Label htmlFor="gen-title">Título Gerado</Label>
                      <div className="flex items-center gap-2">
                      <Input id="gen-title" value={generatedContent.title} readOnly />
                      <Button variant="outline" size="icon" onClick={() => handleCopy(generatedContent.title)}><Copy className="h-4 w-4" /></Button>
                      </div>
                  </div>
                  <div>
                      <Label htmlFor="gen-desc">Descrição Gerada</Label>
                      <div className="flex items-start gap-2">
                          <Textarea id="gen-desc" value={generatedContent.description} readOnly rows={5} />
                          <Button variant="outline" size="icon" onClick={() => handleCopy(generatedContent.description)}><Copy className="h-4 w-4" /></Button>
                      </div>
                  </div>
                  <div>
                      <Label>Tags Geradas</Label>
                      <div className="flex items-start gap-2">
                          <div className="p-3 border rounded-md w-full flex flex-wrap gap-2 min-h-[40px]">
                          {generatedContent.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                          </div>
                          <Button variant="outline" size="icon" onClick={() => handleCopy(generatedContent.tags.join(', '))}><Copy className="h-4 w-4" /></Button>
                      </div>
                  </div>
                  </div>
              )}
          </div>
        </div>
        <div className="space-y-6">
            {/* ERP Image */}
            <div>
              <Label>Imagem Principal (ERP - 2000x2000)</Label>
                <div className="mt-2 aspect-square w-full">
                    {isErpLoading ? (
                        <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg border">
                          <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        </div>
                    ) : erpImage ? (
                        <div className="relative group w-full h-full">
                            <Image
                            src={erpImage.dataUrl}
                            alt="Imagem principal para ERP"
                            width={2000}
                            height={2000}
                            className="rounded-lg border object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                <Button size="sm" onClick={() => handleDownload(erpImage.dataUrl, erpImage.fileName)}>
                                    <Download className="mr-2 h-4 w-4"/>
                                    Baixar
                                </Button>
                            </div>
                        </div>
                    ) : (
                       <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-lg border border-dashed">
                          <p className="text-muted-foreground text-center p-4">Favorite uma imagem para gerar a versão do ERP.</p>
                       </div>
                    )}
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start">
        {/* Website Images */}
        <div>
            <Label>Imagens para o Site (1300x2000)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                {websiteImages.map((img, idx) => (
                <div key={idx} className="relative group">
                    <Image
                    src={img.dataUrl}
                    alt={`Imagem para o site ${img.width}x${img.height}`}
                    width={img.width}
                    height={img.height}
                    className="rounded-lg border aspect-[130/200] object-cover"
                    data-ai-hint="fashion product"
                    />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <Button size="sm" onClick={() => handleDownload(img.dataUrl, img.fileName)}>
                            <Download className="mr-2 h-4 w-4"/>
                            Baixar
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleFavoriteClick(img.originalFileIndex)} className="text-white hover:text-amber-400">
                           <Star className={cn("h-6 w-6", favoritedImageIndex === img.originalFileIndex ? 'text-amber-400 fill-amber-400' : 'text-white')} />
                        </Button>
                    </div>
                </div>
                ))}
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
