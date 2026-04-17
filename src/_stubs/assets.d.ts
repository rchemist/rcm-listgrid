// Stage 1 baseline: untyped asset imports (CSS modules, images, etc).
// Provider 주입 이후 실제 사용 여부 재검토.

declare module '*.module.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.scss' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.css';
declare module '*.scss';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';

// Kakao Maps SDK injects a global `kakao` object when the script loads.
declare const kakao: any;

// Catch-all for dynamic deep paths under @gjcu/ui/listgrid/ and similar nested subpaths
// that aren't listed in gjcu-ambient.d.ts (e.g., dynamic import() calls).
declare module '@gjcu/ui/listgrid/*';
declare module '@gjcu/ui/listgrid/**/*';
