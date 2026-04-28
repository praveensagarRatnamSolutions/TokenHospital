import { useEffect, useMemo, useRef, useState } from "react";
import type { KioskAd } from "../../../core/types";

export const useDoctorAdCarousel = (ads: KioskAd[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudFrontUrl = import.meta.env.VITE_CLOUDFRONT_URL || "";
  console.log("ads in carousel hook", ads);
  // 🎯 Prepare slides
  const slides = useMemo(() => {
    return ads.filter((a) => a.adId).sort((a, b) => a.order - b.order);
  }, [ads]);

  const currentAd = slides[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(slides.length, 1));
  };

  // ⏱ Handle timing
  useEffect(() => {
    if (!currentAd || !currentAd.adId) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // 🖼 IMAGE timing
    if (currentAd.adId.type === "image") {
      const duration = (currentAd.adId.duration || 5) * 1000;

      timeoutRef.current = setTimeout(() => {
        nextSlide();
      }, duration);
    }

    // 🎥 VIDEO fallback (safety)
    if (currentAd.adId.type === "video") {
      const fallback = (currentAd.adId.duration || 10) * 1000;

      timeoutRef.current = setTimeout(() => {
        nextSlide();
      }, fallback);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, currentAd]);

  const handleVideoEnd = () => {
    nextSlide();
  };

  const activeSlide = slides[currentIndex]
    ? { kind: "ad" as const, ad: slides[currentIndex] }
    : null;

  return {
    state: {
      currentIndex,
      currentAd,
      slides,
      activeSlide,
      cloudFrontUrl,
    },
    actions: {
      nextSlide,
      handleVideoEnd,
    },
  };
};
