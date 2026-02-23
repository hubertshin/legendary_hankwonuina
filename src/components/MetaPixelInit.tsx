'use client';

import { useEffect } from 'react';
import { initPixel } from '@/lib/metaPixel';

export function MetaPixelInit() {
  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    if (pixelId) initPixel(pixelId);
  }, []); 

  return null;
}
