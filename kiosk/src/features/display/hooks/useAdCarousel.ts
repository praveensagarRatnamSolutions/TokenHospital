import { useState, useEffect, useMemo } from "react";
import type { KioskAd, DepartmentQueue } from "../../../core/types";

export type AdSlide = { kind: "ad"; ad: KioskAd; duration: number };
export type DeptSlide = { kind: "dept"; dept: DepartmentQueue; duration: number };
export type Slide = AdSlide | DeptSlide;

const DEPT_SLIDE_DURATION = 8;
const AD_INTERVAL = 2;

export const useAdCarousel = (
  ads: KioskAd[],
  isOnline: boolean,
  departments: DepartmentQueue[],
  onLayoutChange?: (layout: "carousel" | "fullscreen") => void
) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cloudFrontUrl = import.meta.env.VITE_CLOUDFRONT_URL || "";

  const filteredAds = useMemo(
    () => (isOnline ? ads : ads.filter((ad) => ad.adId?.type === "image")),
    [ads, isOnline]
  );

  const slides: Slide[] = useMemo(() => {
    const result: Slide[] = [];
    let deptIdx = 0;

    filteredAds.forEach((ad, i) => {
      result.push({
        kind: "ad",
        ad,
        duration: ad.adId?.duration || 10,
      });

      if ((i + 1) % AD_INTERVAL === 0 && departments.length > 0) {
        result.push({
          kind: "dept",
          dept: departments[deptIdx % departments.length],
          duration: DEPT_SLIDE_DURATION,
        });
        deptIdx++;
      }
    });

    if (filteredAds.length === 0 && departments.length > 0) {
      departments.forEach((dept) =>
        result.push({ kind: "dept", dept, duration: DEPT_SLIDE_DURATION })
      );
    }

    return result;
  }, [filteredAds, departments]);

  const activeSlide = slides[currentIndex % Math.max(slides.length, 1)];

  // Notify parent of layout changes
  useEffect(() => {
    if (activeSlide?.kind === "ad" && onLayoutChange) {
      const layout =
        activeSlide.ad.adId?.displayArea === "fullscreen"
          ? "fullscreen"
          : "carousel";
      onLayoutChange(layout);
    }
  }, [activeSlide, onLayoutChange]);

  // Auto-advance timer
  useEffect(() => {
    if (slides.length === 0) return;

    if (activeSlide?.kind === "ad" && activeSlide.ad.adId?.type === "video" && isOnline) {
      return; 
    }

    const duration = (activeSlide?.duration || 10) * 1000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, slides.length, activeSlide, isOnline]);

  const handleVideoEnd = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(slides.length, 1));
  };
  
  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  }

  return {
    state: {
      slides,
      activeSlide,
      currentIndex,
      cloudFrontUrl
    },
    actions: {
      handleVideoEnd,
      handleDotClick
    }
  };
};
