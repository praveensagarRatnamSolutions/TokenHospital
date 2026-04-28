import { useState, useEffect, useMemo } from "react";
import type { KioskAd, DepartmentQueue } from "../../../core/types";

export type AdSlide = {
  kind: "ad";
  ad: KioskAd;
  duration: number;
  isActive: boolean;
};
export type DeptSlide = {
  kind: "dept";
  dept: DepartmentQueue;
  duration: number;
};
export type Slide = AdSlide | DeptSlide;

const DEPT_SLIDE_DURATION = 8;

export const useAdCarousel = (
  ads: KioskAd[],
  isOnline: boolean,
  departments: DepartmentQueue[],
  onLayoutChange?: (layout: "carousel" | "fullscreen") => void,
) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cloudFrontUrl = import.meta.env.VITE_CLOUDFRONT_URL || "";

  // ✅ Filter ads (offline support)
  const filteredAds = useMemo(
    () => (isOnline ? ads : ads.filter((ad) => ad.adId?.type === "image")),
    [ads, isOnline],
  );

  // ✅ Generate slides (FIXED LOGIC)
  const slides: Slide[] = useMemo(() => {
    const result: Slide[] = [];
    const adCount = filteredAds.length;
    const deptCount = departments.length;
    const maxLen = Math.max(adCount, deptCount);

    for (let i = 0; i < maxLen; i++) {
      if (adCount > 0) {
        const ad = filteredAds[i % adCount];
        result.push({
          kind: "ad",
          ad,
          duration: ad.adId?.duration || 10,
          isActive: false,
        });
      }
      if (deptCount > 0) {
        const dept = departments[i % deptCount];
        result.push({
          kind: "dept",
          dept,
          duration: DEPT_SLIDE_DURATION,
        });
      }
    }

    return result;
  }, [filteredAds, departments]);

  // ✅ Active slide
  const activeSlide = slides[currentIndex % Math.max(slides.length, 1)];

  // ✅ Layout control (fullscreen vs carousel)
  useEffect(() => {
    if (activeSlide?.kind === "ad" && onLayoutChange) {
      const layout =
        activeSlide.ad.adId?.displayArea === "fullscreen"
          ? "fullscreen"
          : "carousel";

      onLayoutChange(layout);
    }
  }, [activeSlide, onLayoutChange]);

  // ✅ Auto slide timer
  useEffect(() => {
    if (slides.length === 0) return;

    // 🎥 If video → wait for end event
    if (
      activeSlide?.kind === "ad" &&
      activeSlide.ad.adId?.type === "video" &&
      isOnline
    ) {
      return;
    }

    const duration = (activeSlide?.duration || 10) * 1000;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, slides.length, activeSlide, isOnline]);

  // ✅ Video ended → move next
  const handleVideoEnd = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(slides.length, 1));
  };

  // ✅ Manual navigation
  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return {
    state: {
      slides,
      activeSlide,
      currentIndex,
      cloudFrontUrl,
    },
    actions: {
      handleVideoEnd,
      handleDotClick,
    },
  };
};
