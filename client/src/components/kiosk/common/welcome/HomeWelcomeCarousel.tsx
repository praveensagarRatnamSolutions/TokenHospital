'use client';

import './HomeWelcomeCarousel.css';

import React, { useEffect, useRef,useState } from 'react';

import { cn } from '@/lib/utils';
import { Ad } from '@/modules/admin/ads';

interface CarouselItem {
  _id: string;
  title: string;
  type: 'image' | 'video';
  fileName: string;
  contentType: string;
  fileKey: string;
  displayArea: string;
  hospitalId: string;
  departmentId: string | null;
  duration: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HomeWelcomeCarouselProps {
  items: Ad[];
  onStart?: () => void;
  autoPlay?: boolean;
  showIndicators?: boolean;
  showCTA?: boolean;
  ctaText?: string;
  className?: string;
  baseUrl?: string; // Base URL for your media files
}

const HomeWelcomeCarousel: React.FC<HomeWelcomeCarouselProps> = ({
  items,
  onStart,
  autoPlay = true,
  showIndicators = true,
  showCTA = true,
  ctaText = 'Tap to get token',
  className = '',
  baseUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeItems = items.filter((item) => item.isActive);

  const currentItem = activeItems[currentIndex];

  // Reset video refs when items change
  useEffect(() => {
    videoRefs.current = new Array(activeItems.length).fill(null);
  }, [activeItems.length]);

  // Get media URL
  const getMediaUrl = (fileKey: string) => {
    return `${baseUrl}/${fileKey}`;
  };

  // Auto-advance logic
  useEffect(() => {
    if (!autoPlay || !isPlaying || !currentItem) return;

    const advanceToNext = () => {
      setCurrentIndex((prev) => (prev + 1) % activeItems.length);
    };

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer based on media type
    if (currentItem.type === 'image') {
      // For images, use the duration from API (in seconds)
      const duration = (currentItem.duration || 10) * 1000;
      timerRef.current = setTimeout(advanceToNext, duration);
    } else if (currentItem.type === 'video') {
      // For videos, wait for video to end
      const videoElement = videoRefs.current[currentIndex];
      if (videoElement) {
        const handleVideoEnd = () => {
          advanceToNext();
        };
        videoElement.addEventListener('ended', handleVideoEnd);

        return () => {
          videoElement.removeEventListener('ended', handleVideoEnd);
        };
      } else {
        // Fallback if video element not ready
        const duration = (currentItem.duration || 10) * 1000;
        timerRef.current = setTimeout(advanceToNext, duration);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, currentItem, autoPlay, isPlaying, activeItems.length]);

  // Handle media loading and playback
  useEffect(() => {
    if (!currentItem) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);

    if (currentItem.type === 'video') {
      const videoElement = videoRefs.current[currentIndex];
      if (videoElement) {
        videoElement.currentTime = 0;
        videoElement.load();

        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsLoading(false);
              setIsPlaying(true);
            })
            .catch((error) => {
              console.log('Video autoplay failed:', error);
              setIsLoading(false);
              // If autoplay fails, use duration fallback
              const duration = (currentItem.duration || 10) * 1000;
              timerRef.current = setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % activeItems.length);
              }, duration);
            });
        }
      }
    } else if (currentItem.type === 'image') {
      // Preload image
      const img = new Image();
      img.src = getMediaUrl(currentItem.fileKey);
      img.onload = () => {
        setIsLoading(false);
      };
      img.onerror = () => {
        console.error('Failed to load image:', currentItem.fileKey);
        setIsLoading(false);
      };
    }
  }, [currentIndex, currentItem, activeItems.length]);

  // Pause videos when not active
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentIndex) {
        video.pause();
      }
    });
  }, [currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      videoRefs.current.forEach((video) => {
        if (video) {
          video.pause();
          video.removeAttribute('src');
          video.load();
        }
      });
    };
  }, []);

  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleCTAClick = () => {
    if (onStart) {
      onStart();
    }
  };

  if (!currentItem || activeItems.length === 0) {
    return (
      <div className="home-welcome__loading" onClick={handleCTAClick}>
        <div className="home-welcome__loading-spinner"></div>
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <header className={cn('home-welcome__header', className)} onClick={handleCTAClick}>
      {/* Background Overlay */}
      {/* <div className="home-welcome__overlay"></div> */}

      {/* Background Media */}
      <div className="home-welcome__background">
        {currentItem.type === 'image' && (
          <img
            src={getMediaUrl(currentItem.fileKey)}
            alt={currentItem.title || 'Welcome image'}
            className="home-welcome__background-image"
            style={{ opacity: isLoading ? 0 : 1 }}
          />
        )}
        {currentItem.type === 'video' && (
          <video
            ref={(el) => {
              videoRefs.current[currentIndex] = el;
            }}
            src={getMediaUrl(currentItem.fileKey)}
            className="home-welcome__background-video"
            playsInline
            muted={true}
            loop={false}
            preload="auto"
            style={{ opacity: isLoading ? 0 : 1 }}
          />
        )}

        {/* Loading Spinner */}
        {isLoading && <div className="home-welcome__loading-spinner"></div>}
      </div>

      {/* Content */}
      {/* <div className="home-welcome__content">
        <div className="home-welcome__brand">
          <span className="material-symbols-outlined home-welcome__brand-icon">
            medical_services
          </span>
          <div className="home-welcome__brand-divider"></div>
        </div>
        <h1 className="home-welcome__title">
          {currentItem.title || 'Welcome to Our Health Care Services'}
        </h1>
        <p className="home-welcome__subtitle">Experience excellence in medical care</p>
      </div> */}

      {/* Carousel Indicators */}
      {/* {showIndicators && activeItems.length > 1 && (
        <div className="home-welcome__indicators">
          {activeItems.map((_, index) => (
            <button
              key={index}
              className={cn(
                'home-welcome__indicator',
                index === currentIndex && 'home-welcome__indicator--active',
              )}
              onClick={() => handleIndicatorClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )} */}

      {/* Progress Bar for Images */}
      {autoPlay && currentItem.type === 'image' && (
        <div className="home-welcome__progress">
          <div
            className="home-welcome__progress-bar"
            style={{
              animationDuration: `${currentItem.duration || 10}s`,
              animationPlayState: isPlaying ? 'running' : 'paused',
            }}
          />
        </div>
      )}

      {/* CTA Button */}
      {/* {showCTA && (
        <div className="home-welcome__cta" onClick={handleCTAClick}>
          <div className="home-welcome__cta-button">
            <span className="home-welcome__cta-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4L12 20M12 20L18 14M12 20L6 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="home-welcome__cta-text">{ctaText}</span>
          </div>
          <div className="home-welcome__cta-line"></div>
        </div>
      )} */}
    </header>
  );
};

export default HomeWelcomeCarousel;
