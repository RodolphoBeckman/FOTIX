'use server';

/**
 * @fileOverview An AI agent for generating SEO-optimized titles, descriptions, and tags for fashion products.
 *
 * - generateProductInfo - A function that handles the generation of product information.
 * - GenerateProductInfoInput - The input type for the generateProductInfo function.
 * - GenerateProductInfoOutput - The return type for the generateProductInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductInfoInputSchema = z.object({
  imageUrls: z
    .array(z.string())
    .describe('URLs of the product images.  Should be publicly accessible.'),
  productType: z.string().describe('The type of product (e.g., dress, shirt, shoes).'),
  productDetails: z.string().optional().describe('Any additional details about the product.'),
});
export type GenerateProductInfoInput = z.infer<typeof GenerateProductInfoInputSchema>;

const GenerateProductInfoOutputSchema = z.object({
  title: z.string().describe('The SEO-optimized title for the product.'),
  description: z.string().describe('The SEO-optimized description for the product.'),
  tags: z.array(z.string()).describe('The SEO-optimized tags for the product.'),
});
export type GenerateProductInfoOutput = z.infer<typeof GenerateProductInfoOutputSchema>;

export async function generateProductInfo(input: GenerateProductInfoInput): Promise<GenerateProductInfoOutput> {
  return generateProductInfoFlow(input);
}

const generateProductInfoPrompt = ai.definePrompt({
  name: 'generateProductInfoPrompt',
  input: { schema: GenerateProductInfoInputSchema },
  output: { schema: GenerateProductInfoOutputSchema },
  prompt: `Você é um especialista em SEO e copywriter para e-commerce de moda.

Sua tarefa é criar um título, uma descrição e tags otimizadas para o produto a seguir, com base no tipo de produto, detalhes e URLs de imagem. Use as imagens para extrair atributos como cor, estilo, tecido, corte e detalhes da peça.

{{#each imageUrls}}
Image: {{media url=this}}
{{/each}}
Product Type: {{{productType}}}
Product Details: {{{productDetails}}}

Instruções:
- Título: Crie um título curto, objetivo e atrativo que inclua o nome do produto e uma característica principal (ex: "Camisa de Linho Azul Marinho" ou "Vestido Midi Floral com Babados").
- Descrição: Escreva uma descrição persuasiva e detalhada. Destaque o tecido, a modelagem, os detalhes (botões, gola, etc.), e sugira ocasiões de uso. Use uma linguagem que inspire a cliente a se imaginar usando a peça.
- Tags: Gere tags relevantes e abrangentes, incluindo variações de nome, cor, tecido, estilo e ocasiões. As tags não devem conter espaços (por exemplo, use 'camisadelinho' em vez de 'camisa de linho').
`,
  model: 'googleai/gemini-1.5-flash',
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});


const generateProductInfoFlow = ai.defineFlow(
  {
    name: 'generateProductInfoFlow',
    inputSchema: GenerateProductInfoInputSchema,
    outputSchema: GenerateProductInfoOutputSchema,
  },
  async input => {
    const {output} = await generateProductInfoPrompt(input);
    return output!;
  }
);
