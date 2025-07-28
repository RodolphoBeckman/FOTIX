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

const prompt = ai.definePrompt({
  name: 'generateProductInfoPrompt',
  input: {schema: GenerateProductInfoInputSchema},
  output: {schema: GenerateProductInfoOutputSchema},
  prompt: `You are an SEO expert specializing in fashion e-commerce.

  Generate an SEO-optimized title, description, and tags for the following product, given the product type, details, and image URLs.  Use the image URLs to understand attributes about the product such as color, style, pattern, etc.

  Product Type: {{{productType}}}
  Product Details: {{{productDetails}}}
  Image URLs:
  {{#each imageUrls}}
  - {{{this}}}
  {{/each}}
  
  Ensure the title is concise and engaging.
  The description should be detailed and persuasive.
  The tags should be relevant and comprehensive.

  Format the output as a JSON object with "title", "description", and "tags" fields.
  `,config: {
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
    const {output} = await ai.generate({
        model: 'googleai/gemini-pro-vision',
        prompt: `You are an SEO expert specializing in fashion e-commerce.

        Generate an SEO-optimized title, description, and tags for the following product, given the product type, details, and image URLs.  Use the image URLs to understand attributes about the product such as color, style, pattern, etc.
      
        Product Type: ${input.productType}
        Product Details: ${input.productDetails}
        Image URLs:
        ${input.imageUrls.map(url => `- ${url}`).join('\n')}
        
        Ensure the title is concise and engaging.
        The description should be detailed and persuasive.
        The tags should be relevant and comprehensive.
      
        Format the output as a JSON object with "title", "description", and "tags" fields.
        `,
        output: {
            schema: GenerateProductInfoOutputSchema,
        },
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
    return output!;
  }
);
