'use client';

import {createNextApiHandler} from '@genkit-ai/next';
import '@/ai/flows/generate-product-info';

export const maxDuration = 60; // Set max duration to 60 seconds

const handler = createNextApiHandler();

export const GET = handler.GET;
export const POST = handler.POST;

    