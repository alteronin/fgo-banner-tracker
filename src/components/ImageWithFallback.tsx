"use client";

import { useCallback, useState, type ReactNode } from "react";
import Image, { type ImageProps } from "next/image";

interface ImageWithFallbackProps extends ImageProps {
  fallback?: ReactNode;
}

type ImageStatus = "loading" | "loaded" | "error";

export function ImageWithFallback({
  fallback,
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [status, setStatus] = useState<ImageStatus>("loading");

  const handleImgRef = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete) {
      setStatus(img.naturalWidth > 0 ? "loaded" : "error");
    }
  }, []);

  if (status === "error") {
    return (
      <>
        {fallback ?? (
          <div className="bg-gray-800 flex items-center justify-center w-full h-full">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {props.fill && status === "loading" && (
        <div
          className="absolute inset-0 bg-gray-800 animate-pulse"
          aria-hidden="true"
        />
      )}
      <Image
        {...props}
        ref={handleImgRef}
        alt={props.alt}
        onLoad={() => setStatus("loaded")}
        onError={(e) => {
          setStatus("error");
          onError?.(e);
        }}
      />
    </>
  );
}
