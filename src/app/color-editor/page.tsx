'use client';

import * as React from 'react';
import Image from 'next/image';
import { changeClothingColor } from '@/ai/flows/change-clothing-color';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Upload, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSpotlight } from '@/hooks/use-spotlight';

export default function ColorEditorPage() {
    const [originalImageFile, setOriginalImageFile] = React.useState<File | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = React.useState<string | null>(null);
    const [editedImageUrl, setEditedImageUrl] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [formState, setFormState] = React.useState({
        description: '',
        originalColor: '',
        newColor: '',
    });
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const cardRef = useSpotlight<HTMLDivElement>();
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setOriginalImageFile(file);
            setOriginalImageUrl(URL.createObjectURL(file));
            setEditedImageUrl(null);
        } else if (file) {
            toast({ variant: 'destructive', title: 'Tipo de Arquivo Inválido' });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!originalImageFile || !formState.description || !formState.originalColor || !formState.newColor) {
            toast({ variant: 'destructive', title: 'Todos os campos são obrigatórios' });
            return;
        }

        setIsLoading(true);
        setEditedImageUrl(null);

        const fileToDataUri = (file: File): Promise<string> => 
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

        try {
            const photoDataUri = await fileToDataUri(originalImageFile);
            const result = await changeClothingColor({
                photoDataUri,
                ...formState,
            });
            setEditedImageUrl(result.editedPhotoDataUri);
        } catch (error) {
            console.error('Color change failed:', error);
            toast({
                variant: 'destructive',
                title: 'Falha na Edição',
                description: 'Não foi possível editar a cor da imagem. Por favor, tente novamente.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!editedImageUrl) return;
        const link = document.createElement('a');
        link.href = editedImageUrl;
        link.download = `edited_${originalImageFile?.name || 'image.png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container mx-auto py-10 animate-in fade-in-0 duration-500">
            <Card ref={cardRef} className="card-spotlight mx-auto max-w-6xl">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Editor de Cores com IA</CardTitle>
                    <CardDescription>Mude a cor das roupas em suas fotos de produtos instantaneamente com IA.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">1. Enviar Imagem</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!originalImageUrl ? (
                                        <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50">
                                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                            <Upload className="w-12 h-12 text-muted-foreground" />
                                            <p className="mt-4 font-semibold">Clique para enviar uma imagem</p>
                                        </div>
                                    ) : (
                                        <Image src={originalImageUrl} width={500} height={500} alt="Original product" className="rounded-lg border w-full aspect-square object-cover" data-ai-hint="fashion clothing" />
                                    )}
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">2. Forneça os Detalhes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="description">Descrição do Produto</Label>
                                            <Input id="description" name="description" value={formState.description} onChange={handleInputChange} placeholder="ex: Uma camiseta de algodão" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="originalColor">Cor Original</Label>
                                                <Input id="originalColor" name="originalColor" value={formState.originalColor} onChange={handleInputChange} placeholder="ex: Branco" required />
                                            </div>
                                            <div>
                                                <Label htmlFor="newColor">Nova Cor</Label>
                                                <Input id="newColor" name="newColor" value={formState.newColor} onChange={handleInputChange} placeholder="ex: Azul Marinho" required />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full" disabled={isLoading || !originalImageFile}>
                                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                            Mudar Cor
                                        </Button>
                                    </form>
                                </CardContent>
                             </Card>
                        </div>
                        <div className="sticky top-24 space-y-4">
                            <Card>
                                <CardHeader>
                                     <CardTitle className="text-xl">3. Obtenha o Resultado</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center space-y-4">
                                    {isLoading && (
                                        <div className="w-full aspect-square flex flex-col items-center justify-center bg-muted/50 rounded-lg border">
                                            <Loader2 className="w-16 h-16 text-primary animate-spin" />
                                            <p className="mt-4 text-muted-foreground">Editando sua imagem...</p>
                                        </div>
                                    )}
                                    {!isLoading && editedImageUrl && (
                                        <div className="w-full space-y-4 animate-in fade-in-0">
                                            <Image src={editedImageUrl} width={500} height={500} alt="Edited product" className="rounded-lg border w-full aspect-square object-cover" data-ai-hint="recolored clothing" />
                                            <Button className="w-full" onClick={handleDownload}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Baixar Imagem Editada
                                            </Button>
                                        </div>
                                    )}
                                    {!isLoading && !editedImageUrl && (
                                        <div className="w-full aspect-square flex flex-col items-center justify-center bg-muted/30 rounded-lg border border-dashed">
                                            <p className="text-muted-foreground text-center p-4">Sua imagem editada aparecerá aqui.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
