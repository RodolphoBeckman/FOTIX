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
  title: z
    .string()
    .describe(
      'SEO-optimized title. Max 60 characters. Format: [Product Name] [Main Feature] [Color/Material]. Example: "Saia Midi Plissada de Seda Pura Rosa"'
    ),
  shortDescription: z
    .string()
    .describe(
      'A captivating subtitle for product listings. Max 120 characters. Highlight a key benefit or style point.'
    ),
  longDescription: z
    .string()
    .describe(
      'A complete and persuasive HTML description. It MUST be valid HTML. Follow this structure strictly: Start with an inspiring paragraph in a <p> tag. Follow with an HTML <ul> list of 3-5 key features (material, fit, details), with each item in a <li> tag. End with a final paragraph with styling suggestions, also in a <p> tag. Example: "<p>Paragraph 1.</p><ul><li><strong>Feature:</strong> Detail 1.</li></ul><p>Paragraph 2.</p>"'
    ),
  toneOfVoice: z
    .string()
    .describe(
      'The tone of voice used in the description (e.g., "Sofisticado e Elegante", "Moderno e Despojado").'
    ),
  targetAudience: z
    .string()
    .describe(
      'A brief description of the ideal customer for this product (e.g., "Mulher moderna que valoriza peças atemporais e de alta qualidade.").'
    ),
  seoTags: z
    .array(z.string())
    .describe(
      'A list of relevant, comprehensive SEO tags. Must not contain spaces (e.g., use "saiamidi" instead of "saia midi").'
    ),
});
export type GenerateProductInfoOutput = z.infer<typeof GenerateProductInfoOutputSchema>;

export async function generateProductInfo(input: GenerateProductInfoInput): Promise<GenerateProductInfoOutput> {
  return generateProductInfoFlow(input);
}

const generateProductInfoPrompt = ai.definePrompt({
  name: 'generateProductInfoPrompt',
  input: { schema: GenerateProductInfoInputSchema },
  output: { schema: GenerateProductInfoOutputSchema },
  prompt: `
      ## ROLE & GOAL ##
      You are "Athena", the AI Marketing Director for a luxury online fashion brand. Your goal is to create compelling, sophisticated, and SEO-optimized product content that not only describes the item but also inspires desire and drives sales. You write in flawless Brazilian Portuguese.

      ## CRITICAL INSTRUCTIONS ##
      1.  **Focus on the Primary Product**: Your entire analysis and output MUST be based on the \`productType\` provided by the user. If the image shows a full outfit, but the \`productType\` is "Saia" (Skirt), you will ignore the blouse, shoes, and any other accessories. Your description, title, and all other fields must be exclusively about the skirt. This is the most important rule.
      2.  **Image Analysis**: Use the provided images to extract key visual attributes of the PRIMARY PRODUCT ONLY. Analyze:
          *   **Material & Texture**: What does the fabric look like? (e.g., seda, linho, algodão, plissado, malha, couro).
          *   **Style & Cut**: What is the silhouette? (e.g., midi, longo, evasê, reto, justo, envelope).
          *   **Color & Pattern**: Be specific with colors. (e.g., "azul-marinho profundo", "rosa-quartzo", "estampa floral liberty").
          *   **Unique Details**: Note any special features. (e.g., "botões de madrepérola", "gola assimétrica", "fenda lateral sutil").
      3.  **Content Generation**: Based on your analysis, generate the content following the output schema precisely. For the \`longDescription\`, ensure the HTML is perfectly valid and follows the specified structure with paragraphs and a list.

      ## CONTEXT ##
      {{#each imageUrls}}
      Image of the product: {{media url=this}}
      {{/each}}
      - **Primary Product Type**: {{{productType}}}
      - **Additional Details**: {{{productDetails}}}

      Now, embody the persona of "Athena" and generate the complete product content.
      `,
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
