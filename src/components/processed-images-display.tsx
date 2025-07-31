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
import { Loader2, Sparkles, Copy, Download, Star, Image as ImageIcon, MonitorSmartphone, Archive } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { cn, formatBytes } from '@/lib/utils';
import { useSpotlight } from '@/hooks/use-spotlight';

interface ProcessedImagesDisplayProps {
  imageSet: ProcessedImageSet;
  isGroup: boolean;
}

const productTypes = ["Vestido", "Camisa", "Camiseta", "Calças", "Jeans", "Shorts", "Saia", "Jaqueta", "Casaco", "Colete", "Bolsa", "Acessório", "Conjunto"];

export function ProcessedImagesDisplay({ imageSet, isGroup }: ProcessedImagesDisplayProps) {
  const [productType, setProductType] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedContent, setGeneratedContent] = React.useState<GenerateProductInfoOutput | null>(null);
  const [favoritedImageIndex, setFavoritedImageIndex] = React.useState<number | null>(0); // Favorite first by default
  const [erpImage, setErpImage] = React.useState<ProcessedImage | null>(null);
  const [isErpLoading, setIsErpLoading] = React.useState(false);
  const cardRef = useSpotlight<HTMLDivElement>();


  const { toast } = useToast();

  React.useEffect(() => {
    if (favoritedImageIndex !== null) {
      handleFavoriteClick(favoritedImageIndex, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateContent = async () => {
    if (!productType) {
      toast({ variant: 'destructive', title: 'Tipo de produto obrigatório' });
      return;
    }
    const filesForAI = favoritedImageIndex !== null ? [imageSet.originalFiles[favoritedImageIndex]] : imageSet.originalFiles;
     if (filesForAI.length === 0) {
      toast({ variant: 'destructive', title: 'Nenhuma imagem selecionada para gerar conteúdo.' });
      return;
    }

    setIsLoading(true);
    setGeneratedContent(null);
    try {
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

  const handleFavoriteClick = async (index: number, silent = false) => {
    if (index === favoritedImageIndex && erpImage) return;

    setFavoritedImageIndex(index);
    setIsErpLoading(true);
    setErpImage(null);
    try {
        const originalFile = imageSet.originalFiles[index];
        if(!originalFile) {
             if (!silent) toast({ variant: 'destructive', title: 'Arquivo Original Não Encontrado' });
             return;
        }
        const result = await createImageTask(originalFile, 2000, 2000, index);
        setErpImage(result);
    } catch (error) {
        console.error('Failed to generate ERP image:', error);
        if (!silent) toast({ variant: 'destructive', title: 'Falha ao Gerar Imagem ERP' });
    } finally {
        setIsErpLoading(false);
    }
  };

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

  const handleDownloadAll = () => {
    const imagesToDownload = [...imageSet.images];
    if (erpImage) {
        imagesToDownload.unshift(erpImage);
    }

    if (imagesToDownload.length === 0) {
        toast({ variant: 'destructive', title: 'Nenhuma imagem para baixar' });
        return;
    }

    imagesToDownload.forEach((img, index) => {
        setTimeout(() => {
          handleDownload(img.dataUrl, img.fileName);
        }, index * 300);
    });
  };
  
  const cardClasses = "card-spotlight relative overflow-hidden animate-in fade-in-0 bg-card/50 backdrop-blur-lg border-border/20";
  
  // Group View
  if (isGroup) {
    const websiteImages = imageSet.images.filter(img => img.width === 1300 && img.height === 2000);
    const allImages = erpImage ? [erpImage, ...websiteImages] : websiteImages;

    return (
      <Card ref={cardRef} className={cn(cardClasses)}>
        <CardHeader>
          <CardTitle className='font-headline'>Conteúdo do Produto</CardTitle>
          <CardDescription>Selecione o tipo de produto e use a imagem favoritada para gerar descrições com IA.</CardDescription>
        </CardHeader>
        <CardContent>
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
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                )}
                {generatedContent && (
                    <div className="space-y-4 pt-4 animate-in fade-in-0 duration-500">
                    <div>
                        <Label htmlFor="gen-title">Título Gerado</Label>
                        <div className="flex items-center gap-2">
                        <Input id="gen-title" value={generatedContent.title} readOnly className="text-base font-headline" />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(generatedContent.title)}><Copy className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="gen-desc">Descrição Longa</Label>
                        <div className="flex items-start gap-2">
                            <Textarea id="gen-desc" value={generatedContent.longDescription} readOnly rows={6} className="text-base" />
                            <Button variant="outline" size="icon" onClick={() => handleCopy(generatedContent.longDescription)}><Copy className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    <div>
                        <Label>Tags Geradas</Label>
                        <div className="flex items-start gap-2">
                            <div className="p-3 border rounded-md w-full flex flex-wrap gap-2 min-h-[40px] border-border/20">
                            {generatedContent.seoTags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                            </div>
                            <Button variant="outline" size="icon" onClick={() => handleCopy(generatedContent.seoTags.join(', '))}><Copy className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    </div>
                )}
            </div>
        </CardContent>
        <CardFooter className="flex-col items-start bg-secondary/30 p-6 mt-6">
           <div className="w-full space-y-4">
                <div className="flex justify-between items-center w-full">
                    <Label className="text-lg font-semibold font-headline">Imagens Geradas</Label>
                    {(erpImage || websiteImages.length > 0) && (
                        <Button variant="outline" size="sm" onClick={handleDownloadAll}>
                            <Archive className="mr-2 h-4 w-4" />
                            Baixar Todas
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {isErpLoading && !erpImage && (
                         <div className="aspect-[130/200] w-full flex flex-col items-center justify-center bg-muted/50 rounded-lg border border-border/20">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                         </div>
                    )}
                    
                    {allImages.map((img, idx) => (
                    <div key={idx} className="relative group animate-in fade-in-0 duration-300" style={{animationDelay: `${idx*50}ms`}}>
                        <div className='text-center mb-2'>
                             <p className="font-semibold font-headline text-sm text-foreground">
                                {img.width === 2000 ? `ERP (${img.width}x${img.height})` : `Site (${img.width}x${img.height})`}
                            </p>
                             <p className='text-xs text-muted-foreground'>{formatBytes(img.sizeInBytes)}</p>
                        </div>
                        <div className="relative aspect-[130/200]">
                            <Image
                                src={img.dataUrl}
                                alt={`Imagem processada ${img.width}x${img.height}`}
                                fill
                                className={cn(
                                    "rounded-lg border border-border/20 bg-background",
                                    img.width === 2000 ? 'object-contain p-2' : 'object-cover'
                                )}
                                data-ai-hint="fashion product"
                            />
                        </div>
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <Button size="sm" onClick={() => handleDownload(img.dataUrl, img.fileName)}>
                                <Download className="mr-2 h-4 w-4"/>
                                Baixar
                            </Button>
                            {img.width !== 2000 && (
                                <Button size="icon" variant="ghost" onClick={() => handleFavoriteClick(img.originalFileIndex)} className="text-white hover:text-amber-400">
                                    <Star className={cn("h-6 w-6", favoritedImageIndex === img.originalFileIndex ? 'text-amber-400 fill-amber-400' : 'text-white')} />
                                </Button>
                            )}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </CardFooter>
      </Card>
    );
  }

  // Individual View
  return (
    <Card ref={cardRef} className={cn(cardClasses, "p-0")}>
        <CardContent className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 p-4">
            <div className="flex flex-col gap-4">
                 <div className="relative">
                    <Image 
                      src={imageSet.images.find(img => img.width === 1300)!.dataUrl}
                      alt={imageSet.originalFileName}
                      width={130}
                      height={200}
                      className="rounded-md border border-border/20 object-cover aspect-[130/200]"
                      data-ai-hint="fashion product"
                    />
                 </div>
                 <div className="flex flex-col gap-2">
                   <Button size="sm" variant="outline" onClick={() => handleDownload(imageSet.images.find(img => img.width === 1300)!.dataUrl, imageSet.images.find(img => img.width === 1300)!.fileName)}>
                     <MonitorSmartphone className="mr-2 h-4 w-4" /> Site
                   </Button>
                   <Button size="sm" variant="outline" onClick={() => handleDownload(imageSet.images.find(img => img.width === 2000)!.dataUrl, imageSet.images.find(img => img.width === 2000)!.fileName)}>
                     <ImageIcon className="mr-2 h-4 w-4" /> ERP
                   </Button>
                 </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-2">
                  <div className="flex-grow">
                    <Label htmlFor={`product-type-${imageSet.originalFileName}`} className="text-xs">{imageSet.originalFileName}</Label>
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
                  <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-8 w-full" />
                  </div>
              )}
              {generatedContent && (
                  <div className="space-y-2 pt-2 animate-in fade-in-0 duration-500 text-xs">
                    <div>
                        <Label htmlFor="gen-title">Título</Label>
                        <div className="flex items-center gap-2">
                          <Input id="gen-title" value={generatedContent.title} readOnly className="h-8 text-xs font-headline" />
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleCopy(generatedContent.title)}><Copy className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="gen-desc">Descrição</Label>
                        <div className="flex items-start gap-2">
                            <Textarea id="gen-desc" value={generatedContent.longDescription} readOnly rows={3} className="text-xs" />
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleCopy(generatedContent.longDescription)}><Copy className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    <div>
                        <Label>Tags</Label>
                        <div className="flex items-start gap-2">
                            <div className="p-2 border rounded-md w-full flex flex-wrap gap-1 min-h-[32px] border-border/20">
                              {generatedContent.seoTags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                            </div>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleCopy(generatedContent.seoTags.join(', '))}><Copy className="h-4 w-4" /></Button>
                        </div>
                    </div>
                  </div>
              )}
            </div>
        </CardContent>
    </Card>
  );
}
