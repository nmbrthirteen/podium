import { IBM_Plex_Mono, Source_Sans_3, Source_Serif_4 } from 'next/font/google';

const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif' });
const sourceSans = Source_Sans_3({ subsets: ['latin'], variable: '--font-source-sans' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono' });

export const fontVariables = `${sourceSerif.variable} ${sourceSans.variable} ${plexMono.variable}`;
