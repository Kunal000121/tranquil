"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  X,
  Search,
  Loader2,
} from "lucide-react";

import {
  radioStations,
  searchStations,
  getStationsByCountry,
} from "../lib/radioStations";

// const CORS_PROXIES = [
//   "https://cors-anywhere.herokuapp.com/",
//   "https://api.allorigins.win/raw?url=",
//   "https://cors.sh/",
// ];

// const getStreamUrl = (originalUrl, proxyIndex = -1) => {
//   if (proxyIndex === -1) {
//     return originalUrl;
//   }

//   if (proxyIndex < CORS_PROXIES.length) {
//     const proxy = CORS_PROXIES[proxyIndex];
//     return `${proxy}${encodeURIComponent(originalUrl)}`;
//   }

//   return originalUrl;
// };

export default function RadioPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef(null);
  const lastUpdateRef = useRef(0);

  const throttledVolumeUpdate = useCallback((newVolume) => {
    const now = Date.now();
    if (now - lastUpdateRef.current > 100) {
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
      lastUpdateRef.current = now;
    }
  }, []);

  const filteredStations = useMemo(() => {
    const stations = radioStations[selectedCountry]?.stations || [];
    if (!searchQuery) return stations;

    const query = searchQuery.toLowerCase();
    return stations.filter(
      (station) =>
        station.name.toLowerCase().includes(query) ||
        station.description.toLowerCase().includes(query)
    );
  }, [selectedCountry, searchQuery]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      audioRef.current.preload = "none";
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && !isMuted) {
      throttledVolumeUpdate(volume);
    }
  }, [volume, isMuted, throttledVolumeUpdate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const playStation = useCallback(
    async (station) => {
      if (!audioRef.current) return;

      setIsLoading(true);

      try {
        if (isPlaying) {
          audioRef.current.pause();
        }

        audioRef.current.src = station.url;
        audioRef.current.load();

        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          await playPromise;
          setCurrentStation(station);
          setIsPlaying(true);
        }
      } catch (error) {
        console.error("Playback error:", error);
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    },
    [isPlaying]
  );

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentStation) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Play error:", error);
      });
      setIsPlaying(true);
    }
  }, [isPlaying, currentStation]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleVolumeChange = useCallback(
    (e) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      if (isMuted && newVolume > 0) {
        setIsMuted(false);
      }
    },
    [isMuted]
  );

  return (
    <>
      {/* Floating Radio Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:shadow-2xl text-white p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <Radio size={22} />
        {isPlaying && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Radio Player Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 radio-fade-in"
          />

          {/* Modal - Right Sidebar */}
          <div className="fixed right-0 top-0 bottom-0 z-50 w-[95vw] sm:w-96 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl overflow-hidden flex flex-col border-r border-gray-700/50 radio-slide-in">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-xl p-5 flex items-center justify-between border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Radio className="text-white" size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Radio Player</h2>
                  {currentStation && (
                    <p className="text-xs text-white/80 mt-0.5 font-medium">
                      {isPlaying ? "Now Playing" : "Paused"}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/90 hover:bg-white/20 p-2 rounded-xl transition-all hover:rotate-90 duration-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Current Station Display */}
              {currentStation && (
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-5 border-b border-gray-700/50">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={togglePlay}
                      disabled={isLoading}
                      className="flex-shrink-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 text-white p-3 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" size={24} />
                      ) : isPlaying ? (
                        <Pause size={24} />
                      ) : (
                        <Play size={24} className="ml-1" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-base truncate">
                        {currentStation.name}
                      </p>
                      <p className="text-gray-400 text-sm truncate mt-1">
                        {currentStation.description}
                      </p>
                    </div>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-3 bg-gray-900/50 rounded-xl p-3">
                    <button
                      onClick={toggleMute}
                      className="text-white/90 hover:text-purple-400 transition-colors flex-shrink-0 hover:scale-110 duration-200"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer radio-volume-slider"
                        style={{
                          background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
                            (isMuted ? 0 : volume) * 100
                          }%, #374151 ${
                            (isMuted ? 0 : volume) * 100
                          }%, #374151 100%)`,
                        }}
                      />
                    </div>
                    <span className="text-white/90 text-xs font-semibold w-10 text-right">
                      {Math.round((isMuted ? 0 : volume) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Search and Country Selection */}
              <div className="p-4 space-y-3 border-b border-gray-700/50 bg-gray-900/30">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search stations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800/80 text-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-700/50 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-500 text-sm"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {Object.entries(radioStations).map(([code, data]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setSelectedCountry(code);
                        setSearchQuery("");
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all flex-shrink-0 text-xs font-medium ${
                        selectedCountry === code
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105"
                          : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-700/50 hover:scale-105"
                      }`}
                    >
                      <span className="text-base">{data.flag}</span>
                      <span>{data.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stations List */}
              <div className="p-4">
                {filteredStations.length > 0 ? (
                  <div className="grid gap-2">
                    {filteredStations.map((station) => (
                      <div
                        key={station.id}
                        className={`group p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                          currentStation?.id === station.id
                            ? "bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/50 shadow-lg shadow-purple-500/10"
                            : "bg-gray-800/40 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/60"
                        }`}
                        onClick={() => playStation(station)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white font-semibold text-sm truncate">
                                {station.name}
                              </p>
                              {currentStation?.id === station.id &&
                                isPlaying && (
                                  <div className="flex gap-1 items-end h-3">
                                    <div className="w-0.5 bg-gradient-to-t from-green-500 to-green-400 rounded-full radio-wave-1" />
                                    <div className="w-0.5 bg-gradient-to-t from-green-500 to-green-400 rounded-full radio-wave-2" />
                                    <div className="w-0.5 bg-gradient-to-t from-green-500 to-green-400 rounded-full radio-wave-3" />
                                  </div>
                                )}
                            </div>
                            <p className="text-gray-400 text-xs truncate">
                              {station.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-gray-800/50 p-5 rounded-full mb-3">
                      <Radio className="text-gray-600" size={40} />
                    </div>
                    <p className="text-gray-400 text-base font-semibold">
                      No stations found
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Try a different search term
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
