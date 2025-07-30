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

Sua tarefa é criar um título, uma descrição e tags otimizadas para o produto a seguir.

**Instrução Crítica: O Tipo de Produto informado pelo usuário é a fonte primária da verdade. Foque sua descrição e título exclusivamente neste tipo de produto, mesmo que a imagem contenha outros itens (como um look completo). Por exemplo, se o tipo de produto for "Saia", você deve ignorar a blusa e quaisquer outros acessórios na imagem e descrever apenas a saia.**

Use as imagens para extrair atributos do produto principal, como cor, estilo, tecido, corte e detalhes da peça.

{{#each imageUrls}}
Image: {{media url=this}}
{{/each}}
Product Type: {{{productType}}}
Product Details: {{{productDetails}}}

Instruções Adicionais:
- Título: Crie um título curto, objetivo e atrativo que inclua o nome do produto (conforme o Tipo de Produto) e uma característica principal (ex: "Saia Midi Plissada Rosa" ou "Camisa de Linho Azul Marinho").
- Descrição: Escreva uma descrição persuasiva e detalhada sobre o produto principal. Destaque o tecido, a modelagem, os detalhes (botões, gola, etc.), e sugira ocasiões de uso. Use uma linguagem que inspire a cliente a se imaginar usando a peça.
- Tags: Gere tags relevantes e abrangentes para o produto principal, incluindo variações de nome, cor, tecido, estilo e ocasiões. As tags não devem conter espaços (por exemplo, use 'camisadelinho' em vez de 'camisa de linho').
`,
  model: 'googleai/gemini-pro',
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
