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
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setOriginalImageFile(file);
            setOriginalImageUrl(URL.createObjectURL(file));
            setEditedImageUrl(null);
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File Type' });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!originalImageFile || !formState.description || !formState.originalColor || !formState.newColor) {
            toast({ variant: 'destructive', title: 'All fields are required' });
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
                title: 'Editing Failed',
                description: 'Could not edit the image color. Please try again.',
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
        <div className="container mx-auto py-10">
            <Card className="mx-auto max-w-6xl">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">AI Color Editor</CardTitle>
                    <CardDescription>Change the color of clothing in your product photos instantly with AI.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">1. Upload Image</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!originalImageUrl ? (
                                        <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50">
                                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                            <Upload className="w-12 h-12 text-muted-foreground" />
                                            <p className="mt-4 font-semibold">Click to upload an image</p>
                                        </div>
                                    ) : (
                                        <Image src={originalImageUrl} width={500} height={500} alt="Original product" className="rounded-lg border w-full aspect-square object-cover" data-ai-hint="fashion clothing" />
                                    )}
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">2. Provide Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="description">Product Description</Label>
                                            <Input id="description" name="description" value={formState.description} onChange={handleInputChange} placeholder="e.g., A cotton t-shirt" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="originalColor">Original Color</Label>
                                                <Input id="originalColor" name="originalColor" value={formState.originalColor} onChange={handleInputChange} placeholder="e.g., White" required />
                                            </div>
                                            <div>
                                                <Label htmlFor="newColor">New Color</Label>
                                                <Input id="newColor" name="newColor" value={formState.newColor} onChange={handleInputChange} placeholder="e.g., Navy Blue" required />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full" disabled={isLoading || !originalImageFile}>
                                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                            Change Color
                                        </Button>
                                    </form>
                                </CardContent>
                             </Card>
                        </div>
                        <div className="sticky top-24 space-y-4">
                            <Card>
                                <CardHeader>
                                     <CardTitle className="text-xl">3. Get Result</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center space-y-4">
                                    {isLoading && (
                                        <div className="w-full aspect-square flex flex-col items-center justify-center bg-muted/50 rounded-lg border">
                                            <Loader2 className="w-16 h-16 text-primary animate-spin" />
                                            <p className="mt-4 text-muted-foreground">Editing your image...</p>
                                        </div>
                                    )}
                                    {!isLoading && editedImageUrl && (
                                        <div className="w-full space-y-4 animate-in fade-in-0">
                                            <Image src={editedImageUrl} width={500} height={500} alt="Edited product" className="rounded-lg border w-full aspect-square object-cover" data-ai-hint="recolored clothing" />
                                            <Button className="w-full" onClick={handleDownload}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download Edited Image
                                            </Button>
                                        </div>
                                    )}
                                    {!isLoading && !editedImageUrl && (
                                        <div className="w-full aspect-square flex flex-col items-center justify-center bg-muted/30 rounded-lg border border-dashed">
                                            <p className="text-muted-foreground text-center p-4">Your edited image will appear here.</p>
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
