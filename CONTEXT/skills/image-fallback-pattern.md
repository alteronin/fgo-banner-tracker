# Skill: Image Fallback Pattern

## When to Use
Using `next/image` with external image URLs that may break (404, CORS, changed paths). Want graceful degradation instead of broken image icons.

## Pattern

### Component: ImageWithFallback.tsx
```tsx
"use client";

import { useState, type ReactNode } from "react";
import Image, { type ImageProps } from "next/image";

interface ImageWithFallbackProps extends ImageProps {
  fallback?: ReactNode;
}

export function ImageWithFallback({ fallback, onError, ...props }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <>{fallback ?? <div className="bg-gray-800 flex items-center justify-center w-full h-full">
      <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    </div>}</>;
  }

  return (
    <Image
      {...props}
      onError={(e) => { setHasError(true); onError?.(e); }}
    />
  );
}
```

### Usage
```tsx
import { ImageWithFallback } from "./ImageWithFallback";

<ImageWithFallback
  src={item.imageUrl}
  alt={item.name}
  fill
  className="object-cover"
  loading="lazy"
/>
```

### Custom Fallback
```tsx
<ImageWithFallback
  src={item.imageUrl}
  alt={item.name}
  fill
  fallback={<div className="bg-gray-800 text-gray-500 text-xs">No Image</div>}
/>
```

## next.config.ts Required
```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "external-image-domain.com" },
    ],
  },
};
```

## URL Encoding Fix
External URLs with special characters need encoding:
```js
const cleanUrl = url.replace(/\[/g, "%5B").replace(/\]/g, "%5D");
```

## When to Self-Host vs External
- **External + fallback** (chosen): Zero storage, simple, graceful degradation
- **Self-hosted**: Reliable but adds ~24-80MB to repo, needs re-download on updates
- **Vercel Blob**: Clean but adds complexity/cost

## Example: FGO Banner Tracker
- All 742 banner images + 487 servant icons from `static.mana.wiki`
- 24 URLs had unencoded brackets — fixed with `%5B`/`%5D`
- ImageWithFallback shows gray placeholder if any future URLs break
