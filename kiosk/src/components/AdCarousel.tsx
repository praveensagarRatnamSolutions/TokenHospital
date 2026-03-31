import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { KioskAd } from "../types/index";

interface AdCarouselProps {
  ads: KioskAd[];
  isOnline: boolean;
  onLayoutChange?: (layout: "carousel" | "fullscreen") => void;
}

const AdCarousel: React.FC<AdCarouselProps> = ({
  ads,
  isOnline,
  onLayoutChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cloudFrontUrl = import.meta.env.VITE_CLOUDFRONT_URL || "";

  const filteredAds = useMemo(
    () => (isOnline ? ads : ads.filter((ad) => ad.adId?.type === "image")),
    [ads, isOnline],
  );

  const activeAd = filteredAds[currentIndex]?.adId;


  // Notify parent of layout changes
  useEffect(() => {
    if (activeAd && onLayoutChange) {
      const layout =
        activeAd.displayArea === "fullscreen" ? "fullscreen" : "carousel";

      onLayoutChange(layout);
    }
  }, [activeAd, onLayoutChange]);

  useEffect(() => {
    if (filteredAds.length === 0) return;

    const duration = (activeAd?.duration || 10) * 1000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredAds.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, filteredAds.length, activeAd?.duration]);

  if (filteredAds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/20 gap-4">
        <div className="size-20 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
          <span className="text-4xl">?</span>
        </div>
        <p className="font-black uppercase tracking-widest text-sm text-center px-12">
          No content available for display.
          <br />
          Connect to internet to sync ads.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeAd._id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeAd.type === "video" && isOnline ? (
            <video
              src={`${cloudFrontUrl}/${activeAd.fileKey}`}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover bg-black"
              onEnded={() =>
                setCurrentIndex((prev) => (prev + 1) % filteredAds.length)
              }
            />
          ) : (
            <img
              src={`${cloudFrontUrl}/${activeAd.fileKey}`}
              alt={activeAd.title}
              className="w-full h-full object-cover bg-black"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdCarousel;
