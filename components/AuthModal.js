"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Mail,
  Lock,
  User as UserIcon,
  AtSign,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AuthModal({ mode, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    emailOrUniqueId: "",
    password: "",
    uniqueId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uniqueIdAvailable, setUniqueIdAvailable] = useState(null);
  const [checkingUniqueId, setCheckingUniqueId] = useState(false);

  // Check unique ID availability (debounced)
  const checkUniqueIdAvailability = async (uniqueId) => {
    if (!uniqueId || uniqueId.length < 5) {
      setUniqueIdAvailable(null);
      return;
    }

    setCheckingUniqueId(true);
    try {
      const response = await fetch("/api/auth/check-unique-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueId }),
      });

      const data = await response.json();
      setUniqueIdAvailable(data.available);
    } catch (error) {
      console.error("Error checking unique ID:", error);
    } finally {
      setCheckingUniqueId(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/signup";

      let body;
      if (mode === "login") {
        body = {
          emailOrUniqueId: formData.emailOrUniqueId,
          password: formData.password,
        };
      } else {
        body = {
          name: formData.name,
          email: formData.emailOrUniqueId,
          password: formData.password,
          uniqueId: formData.uniqueId,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess(data.user);
        toast.success(
          `${mode === "login" ? "Login" : "Account created"} successful! 🎉`
        );
      } else {
        toast.error(data.error || "An error occurred");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Check unique ID availability when typing
    if (name === "uniqueId" && mode === "signup") {
      const timeoutId = setTimeout(() => {
        checkUniqueIdAvailability(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const switchMode = () => {
    const newMode = mode === "login" ? "signup" : "login";
    // Reset form when switching modes
    setFormData({
      name: "",
      emailOrUniqueId: "",
      password: "",
      uniqueId: "",
    });
    setUniqueIdAvailable(null);
    setCheckingUniqueId(false);
    onClose();
    // Trigger parent to open with new mode
    setTimeout(() => {
      document.dispatchEvent(
        new CustomEvent("openAuthModal", { detail: newMode })
      );
    }, 100);
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

  const formVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fieldVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-zinc-900/95 backdrop-blur-lg text-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-zinc-700/50 shadow-2xl"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className={`p-2 rounded-xl ${
                  mode === "login"
                    ? "bg-blue-600/20 text-blue-400"
                    : "bg-green-600/20 text-green-400"
                }`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {mode === "login" ? <Lock size={20} /> : <UserIcon size={20} />}
              </motion.div>
              <h2
                className={`text-2xl font-bold bg-gradient-to-r ${
                  mode === "login"
                    ? "from-blue-400 to-cyan-400"
                    : "from-green-400 to-emerald-400"
                } bg-clip-text text-transparent`}
              >
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
            </div>
            <motion.button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} />
            </motion.button>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Name Field - Signup Only */}
            {mode === "signup" && (
              <motion.div variants={fieldVariants}>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold mb-2 text-zinc-200"
                >
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
                    size={18}
                  />
                  <motion.input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-zinc-800/80 backdrop-blur-sm text-white pl-11 pr-4 py-3 rounded-xl border border-zinc-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-200"
                    placeholder="Enter your full name"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Email/UniqueID Field */}
            <motion.div variants={fieldVariants}>
              <label
                htmlFor="emailOrUniqueId"
                className="block text-sm font-semibold mb-2 text-zinc-200"
              >
                {mode === "login" ? "Email or Unique ID" : "Email"}
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
                  size={18}
                />
                <motion.input
                  type={mode === "signup" ? "email" : "text"}
                  id="emailOrUniqueId"
                  name="emailOrUniqueId"
                  value={formData.emailOrUniqueId}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-800/80 backdrop-blur-sm text-white pl-11 pr-4 py-3 rounded-xl border border-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                  placeholder={
                    mode === "login"
                      ? "Enter email or unique ID"
                      : "Enter your email"
                  }
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </motion.div>

            {/* Unique ID Field - Signup Only */}
            {mode === "signup" && (
              <motion.div variants={fieldVariants}>
                <label
                  htmlFor="uniqueId"
                  className="block text-sm font-semibold mb-2 text-zinc-200"
                >
                  Unique ID
                </label>
                <div className="relative">
                  <AtSign
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
                    size={18}
                  />
                  <motion.input
                    type="text"
                    id="uniqueId"
                    name="uniqueId"
                    value={formData.uniqueId}
                    onChange={handleChange}
                    required
                    minLength={5}
                    pattern="^[a-zA-Z0-9_.-]+$"
                    className="w-full bg-zinc-800/80 backdrop-blur-sm text-white pl-11 pr-12 py-3 rounded-xl border border-zinc-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-200"
                    placeholder="Choose a unique ID (min 5 chars)"
                    whileFocus={{ scale: 1.02 }}
                  />
                  {formData.uniqueId.length >= 5 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {checkingUniqueId ? (
                        <Loader
                          className="animate-spin text-purple-500"
                          size={20}
                        />
                      ) : uniqueIdAvailable === true ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.2 }}
                        >
                          <Check className="text-green-500" size={20} />
                        </motion.div>
                      ) : uniqueIdAvailable === false ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.2 }}
                        >
                          <AlertCircle className="text-red-500" size={20} />
                        </motion.div>
                      ) : null}
                    </div>
                  )}
                </div>
                <motion.div
                  className="mt-2 text-xs space-y-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-zinc-400">• Minimum 5 characters</p>
                  <p className="text-zinc-400">
                    • Only letters, numbers, dots, hyphens, and underscores
                  </p>
                  <AnimatePresence>
                    {uniqueIdAvailable === false && (
                      <motion.p
                        className="text-red-400 font-medium"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        ❌ This unique ID is already taken
                      </motion.p>
                    )}
                    {uniqueIdAvailable === true && (
                      <motion.p
                        className="text-green-400 font-medium"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        ✅ This unique ID is available!
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}

            {/* Password Field */}
            <motion.div variants={fieldVariants}>
              <label
                htmlFor="password"
                className="block text-sm font-semibold mb-2 text-zinc-200"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
                  size={18}
                />
                <motion.input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full bg-zinc-800/80 backdrop-blur-sm text-white pl-11 pr-12 py-3 rounded-xl border border-zinc-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200"
                  placeholder="Enter your password"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </motion.button>
              </div>
              {mode === "signup" && (
                <motion.p
                  className="mt-1 text-xs text-zinc-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Minimum 6 characters
                </motion.p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={
                isLoading || (mode === "signup" && uniqueIdAvailable === false)
              }
              className={`w-full py-3 px-4 rounded-xl transition-all duration-300 font-semibold text-lg shadow-lg ${
                mode === "login"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              } ${
                isLoading || (mode === "signup" && uniqueIdAvailable === false)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-xl transform hover:scale-105"
              }`}
              variants={fieldVariants}
              whileHover={
                !(
                  isLoading ||
                  (mode === "signup" && uniqueIdAvailable === false)
                )
                  ? { scale: 1.02 }
                  : {}
              }
              whileTap={
                !(
                  isLoading ||
                  (mode === "signup" && uniqueIdAvailable === false)
                )
                  ? { scale: 0.98 }
                  : {}
              }
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  Loading...
                </div>
              ) : mode === "login" ? (
                "Login"
              ) : (
                "Create Account"
              )}
            </motion.button>
          </motion.form>

          {/* Switch Mode */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-zinc-400 text-sm">
              {mode === "login"
                ? "Do not have an account?"
                : "Already have an account?"}
              <motion.button
                onClick={switchMode}
                className={`ml-1 font-semibold transition-colors ${
                  mode === "login"
                    ? "text-green-400 hover:text-green-300"
                    : "text-blue-400 hover:text-blue-300"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mode === "login" ? "Sign up" : "Login"}
              </motion.button>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}