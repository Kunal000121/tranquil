"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  UserPlus,
  Bell,
  Users,
  LogOut,
  Menu,
  Search,
  Loader,
  Coffee,
} from "lucide-react";
import AuthModal from "./AuthModal";
import toast from "react-hot-toast";
import CoffeeGiftModal from "./CoffeeGiftModal";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [friendEmail, setFriendEmail] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleAddFriendById = async (friendId) => {
    try {
      const response = await fetch("/api/friends/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Friend added successfully! 🎉");
        setFriendEmail("");
        setSuggestions([]);
        fetchFriends();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error adding friend");
    }
  };

  useEffect(() => {
    fetchUser();

    const handleOpenAuthModal = (e) => {
      setAuthMode(e.detail);
      setShowAuthModal(true);
    };

    document.addEventListener("openAuthModal", handleOpenAuthModal);
    return () =>
      document.removeEventListener("openAuthModal", handleOpenAuthModal);
  }, []);

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setNotifications(data.user.notifications.filter((n) => !n.read));
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends/list");
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const handleSignup = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setFriends([]);
      setNotifications([]);
      setIsOpen(false);
      toast.success("Logged out successfully! 👋");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const handleNotifyFriend = async (friendId, friendName) => {
    try {
      const response = await fetch("/api/friends/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });

      if (response.ok) {
        toast.success(`Pinged ${friendName}! 👋`);
      } else {
        toast.error("Error sending notification");
      }
    } catch (error) {
      toast.error("Error sending notification");
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      await fetch("/api/user", { method: "PATCH" });
      setNotifications([]);
      toast.success("Notifications marked as read ✓");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

  const renderContent = () => {
    if (!user) {
      return (
        <motion.div
          className="p-4 sm:p-6"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Welcome to Clock App
          </motion.h2>
          <motion.p
            className="text-gray-300 mb-6 text-sm sm:text-base leading-relaxed"
            variants={itemVariants}
          >
            Sign in to connect with friends and send notifications. You can
            still use the radio player without signing in!
          </motion.p>
          <motion.div
            className="mx-4 mb-4 bg-gradient-to-r from-amber-900/30 to-orange-900/30 p-4 rounded-xl border border-amber-600/20 backdrop-blur-sm"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center">
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
                className="text-2xl mb-2"
              >
                ☕
              </motion.div>
              <p className="text-amber-300 text-sm font-medium mb-1">
                Love Clock App?
              </p>
              <p className="text-amber-200/70 text-xs mb-3">
                Buy me a coffee to keep it running!
              </p>
              <motion.button
                onClick={() => setShowCoffeeModal(true)}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Coffee size={16} />
                Buy Me Coffee ☕
              </motion.button>
            </div>
          </motion.div>

          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg transform hover:scale-105"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Login
            </motion.button>
            <motion.button
              onClick={handleSignup}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg transform hover:scale-105"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Account
            </motion.button>
          </motion.div>
        </motion.div>
      );
    }

    switch (activeTab) {
      case "profile":
        return (
          <motion.div
            className="p-4 sm:p-6"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {/* User Header with Avatar and Name */}
            <motion.div className="text-center mb-6" variants={itemVariants}>
              <motion.div
                className="w-14 h-14 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </motion.div>
              <motion.h2
                className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                variants={itemVariants}
              >
                {user.name}
              </motion.h2>
            </motion.div>

            <div className="space-y-4">
              {/* User Information Card */}
              <motion.div
                className="bg-gradient-to-r from-gray-800/50 to-purple-900/40 backdrop-blur-sm rounded-xl border border-gray-600/30 overflow-hidden"
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
              >
                <div className="p-3 font-mono">
                  <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                    <span className="text-blue-400">👤</span>
                    User Information
                  </h3>
                  <div className="space-y-4">
                    {/* Email */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm flex items-center gap-2">
                        <span className="text-blue-400">📧</span>
                        Email
                      </span>
                      <span className="text-white text-sm break-all max-w-[200px] text-right">
                        {user.email}
                      </span>
                    </div>

                    {/* Unique ID */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm flex items-center gap-2">
                        <span className="text-purple-400">🆔</span>
                        Unique ID
                      </span>
                      <span className="text-white text-sm mb-1">
                        @{user.uniqueId}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Coffee Support Section */}
              <motion.div
                className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 p-3 rounded-xl border border-amber-600/30 backdrop-blur-sm"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-center">
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
                    className="inline-block mb-2"
                  >
                    ☕
                  </motion.div>
                  <p className="text-amber-300 text-sm font-medium mb-1">
                    Enjoying Clock App?
                  </p>
                  <p className="text-amber-200/80 text-xs mb-2">
                    Fuel my coding sessions with coffee!
                  </p>
                  <motion.button
                    onClick={() => setShowCoffeeModal(true)}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Coffee size={16} />
                    Buy Me Coffee ☕
                  </motion.button>
                </div>
              </motion.div>

              <motion.button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut size={16} />
                Logout
              </motion.button>
            </div>
          </motion.div>
        );

      case "friends":
        return (
          <motion.div
            className="p-4 sm:p-6"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="flex items-center justify-between mb-6"
              variants={itemVariants}
            >
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Friends ({friends.length})
              </h2>
            </motion.div>

            {/* Add Friend Form */}
            <motion.div className="mb-6" variants={itemVariants}>
              <label className="text-sm text-gray-300 font-medium mb-2 block">
                Find friend by User ID
              </label>
              <div className="relative">
                <motion.input
                  type="text"
                  placeholder="Type user ID..."
                  value={friendEmail}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setFriendEmail(value);

                    if (value.length < 2) {
                      setSuggestions([]);
                      setSearchLoading(false);
                      return;
                    }

                    setSearchLoading(true);
                    try {
                      const res = await fetch(
                        `/api/users/search?query=${value}`
                      );
                      if (res.ok) {
                        const data = await res.json();
                        setSuggestions(data.users);
                      }
                    } catch (err) {
                      console.error("Search error:", err);
                    } finally {
                      setSearchLoading(false);
                    }
                  }}
                  className="w-full bg-gray-800 text-white px-4 py-3 pr-10 rounded-xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                  whileFocus={{ scale: 1.02 }}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {searchLoading ? (
                    <Loader className="animate-spin text-blue-400" size={18} />
                  ) : (
                    <Search className="text-gray-400" size={18} />
                  )}
                </div>

                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute mt-2 w-full bg-gray-800 border border-gray-600 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto"
                    >
                      {suggestions.map((suggestedUser, index) => (
                        <motion.div
                          key={suggestedUser._id}
                          onClick={() => handleAddFriendById(suggestedUser._id)}
                          className="px-4 py-3 hover:bg-gray-700 cursor-pointer flex justify-between items-center transition-colors duration-150"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 5 }}
                        >
                          <div>
                            <p className="text-white font-semibold">
                              {suggestedUser.name}
                            </p>
                            <p className="text-gray-400 text-sm">
                              @{suggestedUser.uniqueId}
                            </p>
                          </div>
                          <motion.button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Add
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Friends List */}
            <motion.div
              className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar"
              variants={itemVariants}
            >
              <AnimatePresence>
                {friends.map((friend, index) => (
                  <motion.div
                    key={friend.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 rounded-xl flex items-center justify-between shadow-lg border border-gray-600 hover:border-blue-500/50 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate text-sm sm:text-base">
                        {friend.name}
                      </p>
                      <p className="text-gray-400 text-xs sm:text-sm truncate">
                        {friend.email}
                      </p>
                    </div>
                    <motion.button
                      onClick={() =>
                        handleNotifyFriend(friend.userId, friend.name)
                      }
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 ml-3 flex-shrink-0 font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Ping 👋
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {friends.length === 0 && (
                <motion.div
                  className="text-center py-12"
                  variants={itemVariants}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Users className="mx-auto text-gray-500 mb-4" size={64} />
                  </motion.div>
                  <p className="text-gray-400 text-lg font-medium">
                    No friends added yet
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Add friends by their user ID to start pinging!
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        );

      case "notifications":
        return (
          <motion.div
            className="p-4 sm:p-6"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="flex items-center justify-between mb-6"
              variants={itemVariants}
            >
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Notifications ({notifications.length})
              </h2>
              {notifications.length > 0 && (
                <motion.button
                  onClick={markNotificationsAsRead}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Mark all read
                </motion.button>
              )}
            </motion.div>

            <motion.div
              className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar"
              variants={itemVariants}
            >
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4 rounded-xl border border-blue-500/30 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 15, 0],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: index * 0.2,
                        }}
                      >
                        <Bell
                          className="text-blue-400 flex-shrink-0 mt-1"
                          size={18}
                        />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm sm:text-base">
                          {notification.fromName}
                        </p>
                        <p className="text-gray-300 text-sm">
                          {notification.message}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {notifications.length === 0 && (
                <motion.div
                  className="text-center py-12"
                  variants={itemVariants}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, -10, 10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Bell className="mx-auto text-gray-500 mb-4" size={64} />
                  </motion.div>
                  <p className="text-gray-400 text-lg font-medium">
                    No new notifications
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    You will see pings from your friends here
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Enhanced Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 border border-white/20 shadow-2xl"
        whileHover={{
          scale: 1.1,
          boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
        }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <Menu size={24} />
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
          />
        )}
      </AnimatePresence>

      {/* Enhanced Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed inset-y-0 left-0 z-50 bg-gray-900/95 backdrop-blur-lg text-white shadow-2xl border-r border-gray-700/50 ${
              isMobile ? "w-full" : "w-96"
            }`}
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Enhanced Header */}
            <motion.div
              className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.h1
                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 100%",
                }}
              >
                Clock App
              </motion.h1>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={24} />
              </motion.button>
            </motion.div>

            {/* Enhanced Navigation Tabs */}
            {user && (
              <motion.div
                className="flex border-b border-gray-700/50 bg-gray-800/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {[
                  {
                    id: "profile",
                    icon: User,
                    label: "Profile",
                    gradient: "from-purple-500 to-pink-500",
                  },
                  {
                    id: "friends",
                    icon: Users,
                    label: "Friends",
                    gradient: "from-green-500 to-blue-500",
                  },
                  {
                    id: "notifications",
                    icon: Bell,
                    label: "Notifications",
                    gradient: "from-yellow-500 to-orange-500",
                  },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-2 sm:px-4 transition-all duration-200 relative overflow-hidden ${
                      activeTab === tab.id
                        ? "text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} opacity-20`}
                        layoutId="activeTab"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <tab.icon size={16} className="sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">
                      {tab.label}
                    </span>
                    {tab.id === "notifications" && notifications.length > 0 && (
                      <motion.span
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.2 }}
                      >
                        {notifications.length}
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Enhanced Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {renderContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coffee Gift Modal */}
      <AnimatePresence>
        {showCoffeeModal && (
          <CoffeeGiftModal onClose={() => setShowCoffeeModal(false)} />
        )}
      </AnimatePresence>

      {/* Enhanced Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuthModal(false)}
            onSuccess={(userData) => {
              setUser(userData);
              setShowAuthModal(false);
              fetchUser();
              toast.success("Authentication successful! 🎉");
            }}
          />
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.3);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </>
  );
}