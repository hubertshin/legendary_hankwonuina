declare module 'react-pageflip' {
  import { Component, CSSProperties, ReactNode, RefObject, MutableRefObject } from 'react';

  export interface PageFlip {
    flipNext(): void;
    flipPrev(): void;
    flip(pageNum: number): void;
    turnToPage(pageNum: number): void;
    turnToNextPage(): void;
    turnToPrevPage(): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
  }

  export interface HTMLFlipBookProps {
    width: number;
    height: number;
    size?: 'fixed' | 'stretch';
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    className?: string;
    style?: CSSProperties;
    startPage?: number;
    onFlip?: (e: { data: number }) => void;
    onChangeOrientation?: (e: { data: string }) => void;
    onChangeState?: (e: { data: string }) => void;
    onInit?: (e: { data: PageFlip }) => void;
    onUpdate?: (e: { data: PageFlip }) => void;
    children?: ReactNode;
    ref?: MutableRefObject<HTMLFlipBook | null> | RefObject<HTMLFlipBook | null> | null;
  }

  export default class HTMLFlipBook extends Component<HTMLFlipBookProps> {
    pageFlip(): PageFlip;
  }
}

