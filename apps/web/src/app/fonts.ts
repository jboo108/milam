import { Fraunces, Inter } from 'next/font/google';

// Fraunces — display serif for MILAM's voice.
// opsz + SOFT axes unlock optical sizing + the velvet softness knob.
export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT'],
  style: ['normal', 'italic'],
});

// Inter — UI sans. Variable weight, paired for x-height harmony.
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
