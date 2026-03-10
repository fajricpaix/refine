import { Box, Skeleton } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

type SmartCardMediaProps = {
  src: string;
  alt: string;
  ratio?: string;      // "1/1" | "16/9" | "4/3" | etc
  blurUp?: boolean;    // enable blur-up overlay
  blurSize?: number;   // default 40
};

// ratioCache.ts
const ratioCache = new Map<string, number>();

export function getCachedImageRatio(src: string): Promise<number> {
  if (ratioCache.has(src)) {
    return Promise.resolve(ratioCache.get(src)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const ratio = img.naturalHeight / img.naturalWidth;
      ratioCache.set(src, ratio);
      resolve(ratio);
    };
  });
}


export function SmartCardMedia({
  src,
  alt,
  ratio,
  blurUp = false,
  blurSize = 40,
}: SmartCardMediaProps) {
  const [loaded, setLoaded] = useState(false);
  const [autoRatio, setAutoRatio] = useState<number | null>(null);

  function parseRatio(ratio: string) {
  const [w, h] = ratio.split("/").map(Number);
  return h / w;
}

  // 🔹 auto-detect ratio with cache
  useEffect(() => {
    if (!ratio) {
      getCachedImageRatio(src).then(setAutoRatio);
    }
  }, [ratio, src]);

  const finalRatio = useMemo(() => {
    if (ratio) return parseRatio(ratio);
    return autoRatio ?? 1; // fallback square
  }, [ratio, autoRatio]);

  // 🔹 responsive dimensions
  const mobileW = 300;
  const desktopW = 600;

  const mobileH = Math.round(mobileW * finalRatio);
  const desktopH = Math.round(desktopW * finalRatio);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio ?? `${1 / finalRatio}`,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Skeleton */}
      {!loaded && (
        <Skeleton
          variant="rectangular"
          sx={{ position: "absolute", inset: 0 }}
        />
      )}

      {/* BLUR-UP OVERLAY (OPTIONAL) */}
      {blurUp && !loaded && (
        <img
          src={`${src}?auto=compress&cs=tinysrgb&fit=crop&w=${blurSize}&h=${blurSize}`}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(20px)",
            transform: "scale(1.1)",
          }}
        />
      )}

      {/* MAIN IMAGE */}
      <img
        src={`${src}?auto=compress&cs=tinysrgb&fit=crop&w=${desktopW}&h=${desktopH}`}
        srcSet={`
          ${src}?auto=compress&cs=tinysrgb&fit=crop&w=${mobileW}&h=${mobileH} ${mobileW}w,
          ${src}?auto=compress&cs=tinysrgb&fit=crop&w=${desktopW}&h=${desktopH} ${desktopW}w
        `}
        sizes="(max-width: 600px) 300px, 600px"
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />
    </Box>
  );
}
