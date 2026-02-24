'use client';

import { useEffect } from 'react';
import { initPixel } from '@/lib/metaPixel';

export function MetaPixelInit() {
  useEffect(() => {
    const pixelId = '1151930330177738';
    if (pixelId) initPixel(pixelId);
  }, []);

  return null;
}
