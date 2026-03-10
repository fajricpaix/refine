import React, { useState, useEffect, useRef } from "react";
import { Stack, Typography, Box, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const allImages = Array.from({ length: 200 }, (_, index) => ({
  id: index + 1,
  url: `https://picsum.photos/id/${index + 1}/300/300`,
}));

export default function LazyLoad() {
  const [visibleCount, setVisibleCount] = useState(15);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < allImages.length) {
          setVisibleCount((prev) => prev + 5);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount]);

  return (
    <Stack spacing={4} p={4}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Lazy Load (3 Rows Initial)
      </Typography>

      <Grid container spacing={2}>
        {allImages.slice(0, visibleCount).map((img) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={img.id}>
            <Box
              sx={{
                width: "100%",
                aspectRatio: "1/1",
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "action.hover",
                boxShadow: 1,
              }}
            >
              <LazyLoadImage
                alt={`Image ${img.id}`}
                src={img.url}
                effect="blur"
                placeholder={<Skeleton variant="rectangular" width="100%" height="100%" />}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* 3. Target Element untuk trigger load more baris selanjutnya */}
      {visibleCount < allImages.length && (
        <Box 
            ref={loadMoreRef} 
            sx={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <Typography variant="body2" color="text.secondary">
            Memuat baris selanjutnya...
          </Typography>
        </Box>
      )}
    </Stack>
  );
}