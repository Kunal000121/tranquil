"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  Coffee,
  Heart,
  Copy,
  ExternalLink,
  Smartphone,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CoffeeGiftModal({ onClose }) {
  const QR_CODE_IMAGE = "/puru.jpg";
  const UPI_ID = "puru0222@ptaxis";

  const copyUPIId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success("UPI ID copied! ☕");
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-gray-900/95 backdrop-blur-lg text-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700/50 shadow-2xl"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Header */}
        <motion.div
          className="relative p-5 border-b border-gray-700/50 bg-gradient-to-r from-amber-900/40 to-orange-900/40"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div className="p-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-4xl"
                >
                  <Coffee size={24} />
                </motion.div>
              </motion.div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Buy Me a Coffee ☕
                </h2>
                <p className="text-gray-300 text-sm">
                  Fuel my coding sessions!
                </p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} />
            </motion.button>
          </div>
        </motion.div>

        {/* Content */}
        <div className="p-5">
          {/* Thank you message */}
          <div className="text-center mb-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              Hey there! ☕ If you are enjoying the Clock App, consider buying
              me a coffee! It helps me stay caffeinated while building{" "}
              <span className="text-green-400 font-semibold">free</span> and
              <span className="text-blue-400 font-semibold"> awesome</span> apps
              for you.
            </p>
          </div>

          {/* Coffee Price Options */}
          <motion.div
            className="grid grid-cols-3 gap-2 mb-4"
            variants={itemVariants}
          >
            <motion.div
              className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-2 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-lg">☕</div>
              <div className="text-xs text-amber-400">₹25</div>
              <div className="text-xs text-gray-400">Small Coffee</div>
            </motion.div>
            <motion.div
              className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-2 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-lg">☕☕</div>
              <div className="text-xs text-orange-400">₹50</div>
              <div className="text-xs text-gray-400">Double Shot</div>
            </motion.div>
            <motion.div
              className="bg-red-900/20 border border-red-600/30 rounded-lg p-2 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-lg">☕❤️</div>
              <div className="text-xs text-red-400">₹100</div>
              <div className="text-xs text-gray-400">Premium Brew</div>
            </motion.div>
          </motion.div>

          {/* QR Code Section */}
          <motion.div
            className="bg-gray-200 p-4 rounded-xl mb-4"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-3">
                <Smartphone className="text-zinc-800" size={20} />
                <span className="text-zinc-800 font-semibold">
                  Scan & Gift ☕
                </span>
              </div>

              <Image
                src={QR_CODE_IMAGE}
                alt="UPI QR Code for Coffee"
                width={192}
                height={192}
                className="mb-2 mx-auto rounded-lg"
                priority
              />

              <p className="text-zinc-800 text-xs">
                Choose any amount - every sip counts! ☕
              </p>
            </div>
          </motion.div>

          {/* UPI ID */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/30 mb-4"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-1">UPI ID:</p>
                <p className="text-white font-mono text-sm break-all">
                  {UPI_ID}
                </p>
              </div>
              <motion.button
                onClick={copyUPIId}
                className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Copy size={16} />
              </motion.button>
            </div>
          </motion.div>

          {/* Footer Message */}
          <motion.div className="text-center" variants={itemVariants}>
            <motion.p
              className="text-gray-400 text-sm mb-3"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Your coffee keeps me coding through the night! ☕💻✨
            </motion.p>

            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                >
                  🔒
                </motion.div>
                Secure
              </div>
              <div className="flex items-center gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                >
                  ⚡
                </motion.div>
                Instant
              </div>
              <div className="flex items-center gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                >
                  ☕
                </motion.div>
                Appreciated
              </div>
            </div>

            <motion.div
              className="mt-2 text-xs text-gray-100"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Made with ❤️ and lots of ☕
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
