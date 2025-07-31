'use server';

import { nextHandler } from '@genkit-ai/next';
import '@/ai/flows/generate-product-info';

export const { GET, POST } = nextHandler;
