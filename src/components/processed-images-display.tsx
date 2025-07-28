'use client';

import * as React from 'react';
import Image from 'next/image';
import { generateProductInfo, GenerateProductInfoOutput } from '@/ai/flows/generate-product-info';
import { getCompressedImageUris, ProcessedImageSet } from '@/lib/image-processor';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Download } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface ProcessedImagesDisplayProps {
  imageSet: ProcessedImageSet;
  filesForAI: File[];
}

const productTypes = ["Vestido", "Camisa", "Camiseta", "Calças", "Jeans", "Shorts", "Saia", "Jaqueta", "Casaco", "Suéter", "Sapatos", "Bolsa", "Acessório"];

export function ProcessedImagesDisplay({ imageSet, filesForAI }: ProcessedImagesDisplayProps) {
  const [productType, setProductType] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedContent, setGeneratedContent] = React.useState<GenerateProductInfoOutput | null>(null);
  const { toast } = useToast();

  const handleGenerateContent = async () => {
    if (!productType) {
      toast({ variant: 'destructive', title: 'Tipo de produto obrigatório' });
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

  return (
    <Card className="overflow-hidden animate-in fade-in-0">
      <CardHeader>
        <CardTitle>{imageSet.originalFileName}</CardTitle>
        <CardDescription>Selecione um tipo de produto para gerar conteúdo otimizado para SEO. Baixe as imagens processadas passando o mouse sobre elas.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Label>Imagens Processadas</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {imageSet.images.map((img, idx) => (
              <div key={idx} className="relative group">
                <Image
                  src={img.dataUrl}
                  alt={`Processed image ${img.width}x${img.height}`}
                  width={img.width}
                  height={img.height}
                  className="rounded-lg border aspect-square object-cover"
                  data-ai-hint="fashion product"
                />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <p className="text-white font-bold">{`${img.width} x ${img.height}`}</p>
                  <Button size="sm" className="mt-2" onClick={() => handleDownload(img.dataUrl, img.fileName)}>
                    <Download className="mr-2 h-4 w-4"/>
                    Baixar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
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
      </CardContent>
    </Card>
  );
}
