'use server';

import {nextHandler} from '@genkit-ai/next';
import '@/ai/flows/change-clothing-color';
import '@/ai/flows/generate-product-info';

export const maxDuration = 60; // Set max duration to 60 seconds

export const {GET, POST} = nextHandler();
