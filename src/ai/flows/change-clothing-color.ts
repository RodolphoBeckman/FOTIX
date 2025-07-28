'use server';

/**
 * @fileOverview AI flow to change the color of clothing in an image.
 *
 * - changeClothingColor - A function that handles the color change process.
 * - ChangeClothingColorInput - The input type for the changeClothingColor function.
 * - ChangeClothingColorOutput - The return type for the changeClothingColor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChangeClothingColorInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  originalColor: z.string().describe('The original color of the clothing item.'),
  newColor: z.string().describe('The desired new color for the clothing item.'),
  description: z.string().describe('The description of the clothing item.'),
});
export type ChangeClothingColorInput = z.infer<typeof ChangeClothingColorInputSchema>;

const ChangeClothingColorOutputSchema = z.object({
  editedPhotoDataUri: z
    .string()
    .describe(
      'The edited photo of the clothing item with the new color, as a data URI.'
    ),
});
export type ChangeClothingColorOutput = z.infer<typeof ChangeClothingColorOutputSchema>;

export async function changeClothingColor(input: ChangeClothingColorInput): Promise<ChangeClothingColorOutput> {
  return changeClothingColorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'changeClothingColorPrompt',
  input: {schema: ChangeClothingColorInputSchema},
  output: {schema: ChangeClothingColorOutputSchema},
  prompt: `You are an AI that changes the color of clothing items in images.

  The user will provide a photo of a clothing item, the original color of the item, and the desired new color.
  You should modify the image such that the clothing item appears in the new color, while preserving the textures, shadows, and background of the image.

  Here is the information about the clothing item:
  Description: {{{description}}}
  Original Color: {{{originalColor}}}
  New Color: {{{newColor}}}
  Photo: {{media url=photoDataUri}}

  Return the modified image as a data URI.
  `,
});

const changeClothingColorFlow = ai.defineFlow(
  {
    name: 'changeClothingColorFlow',
    inputSchema: ChangeClothingColorInputSchema,
    outputSchema: ChangeClothingColorOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.photoDataUri}},
        {
          text:
            `Change the color of the clothing item to ${input.newColor}. The original color was ${input.originalColor}. Keep the original textures and shadows.`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {
      editedPhotoDataUri: media!.url,
    };
  }
);
