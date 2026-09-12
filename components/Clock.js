"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function Clock() {
  const [isMounted, setIsMounted] = useState(false);
  const [bgImage, setBgImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const timeRef = useRef(null);
  const dateRef = useRef(null);
  const timerRef = useRef(null);

  // Handle page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Use setTimeout instead of requestAnimationFrame - MUCH more efficient
  useEffect(() => {
    setIsMounted(true);

    const formatTime = (date) =>
      date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

    const formatDate = (date) =>
      date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    let lastDateString = "";

    const updateTime = () => {
      if (!isVisible) return;

      const currentDate = new Date();

      // Update time directly in DOM
      if (timeRef.current) {
        timeRef.current.textContent = formatTime(currentDate);
      }

      // Update date only when it changes
      const newDateString = formatDate(currentDate);
      if (dateRef.current && newDateString !== lastDateString) {
        dateRef.current.textContent = newDateString;
        lastDateString = newDateString;
      }

      // Calculate time until next second for precise timing
      const now = Date.now();
      const msUntilNextSecond = 1000 - (now % 1000);

      // Schedule next update at the exact start of next second
      timerRef.current = setTimeout(updateTime, msUntilNextSecond);
    };

    if (isVisible) {
      // Initial update
      if (timeRef.current && dateRef.current) {
        const now = new Date();
        timeRef.current.textContent = formatTime(now);
        dateRef.current.textContent = formatDate(now);
        lastDateString = formatDate(now);
      }

      // Start the timer
      const now = Date.now();
      const msUntilNextSecond = 1000 - (now % 1000);
      timerRef.current = setTimeout(updateTime, msUntilNextSecond);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isVisible]);

  // Fetch background only once
  useEffect(() => {
    async function fetchBackground() {
      setImageLoading(true);
      try {
        const res = await fetch("/api/background");
        const data = await res.json();
        if (data.image) {
          const img = new Image();
          img.onload = () => {
            setBgImage(data.image);
            setImageLoading(false);
          };
          img.src = data.image;
        }
      } catch (err) {
        console.error("Failed to load background:", err);
        setImageLoading(false);
      }
    }
    fetchBackground();
  }, []);

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-600 via-white to-green-700 text-zinc-800">
        <div className="text-center">
          <div className="text-7xl sm:text-8xl md:text-9xl font-light tracking-wider mb-4 font-mono opacity-50">
            --:--:--
          </div>
          <div className="text-lg sm:text-xl md:text-2xl opacity-80 font-light">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {bgImage && !imageLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {/* Gradient overlay for better text visibility */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-black/60" /> */}

        {/* Additional dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/20" />

        {(!bgImage || imageLoading) && (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-white to-green-700" />
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-2 sm:px-4 md:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center w-full"
        >
          {/* Glass Card - Removed animated glow to reduce CPU */}
          <div className="relative backdrop-blur-sm bg-black/30 border border-white/20 p-3 sm:p-6 md:p-8 lg:p-12 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl mx-2 sm:mx-4 md:mx-auto max-w-none sm:max-w-4xl">
            {/* Static glow instead of animated */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />

            <div className="relative">
              {/* Time Display */}
              <div
                ref={timeRef}
                className="text-6xl xs:text-7xl sm:text-8xl md:text-9xl lg:text-[8rem] xl:text-[10rem] font-light tracking-wider mb-2 sm:mb-4 md:mb-6 font-mono leading-none"
                style={{
                  textShadow: `
                    0 0 10px rgba(0, 0, 0, 0.8),
                    0 0 20px rgba(0, 0, 0, 0.6),
                    2px 2px 4px rgba(0, 0, 0, 0.9)
                  `,
                }}
              >
                00:00:00
              </div>

              {/* Date Display */}
              <div
                ref={dateRef}
                className="text-base sm:text-xl md:text-2xl lg:text-3xl opacity-90 font-light mb-2 sm:mb-4"
                style={{
                  textShadow: `
                    0 0 8px rgba(0, 0, 0, 0.9),
                    1px 1px 2px rgba(0, 0, 0, 1)
                  `,
                }}
              >
                Loading...
              </div>

              {/* Image Credit */}
              <div
                className="text-sm sm:text-base opacity-60 font-light"
                style={{
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
                }}
              >
                {bgImage && !imageLoading && "Image from Unsplash"}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
