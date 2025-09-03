import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, Variants } from 'framer-motion';
import appLogo from "../../assets/applogoblue.png"
import { 
  Heart, 
  Shield, 
  Users, 
  Video, 
  FileText, 
  Newspaper, 
  BookOpen, 
  MessageCircle, 
  CreditCard, 
  Activity,
  Stethoscope, 
  BarChart3, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Menu,
  X,
  ShoppingCart,
  Globe,
  Award,
  Zap,
  Clock,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  const { scrollY } = useScroll();
  const navigate = useNavigate(); 
  
  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 1800], [1, 0]);

  // Animation variants
  const fadeInUp:Variants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const scaleIn:Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const slideInLeft:Variants = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const slideInRight:Variants = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        duration: 0.3, 
        ease: "easeOut",
        staggerChildren: 0.1
      } 
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95, 
      transition: { duration: 0.2 } 
    }
  };

  const dropdownItemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  };

  const handleNavigation = (role: 'doctor' | 'user') => {
    setIsDropdownOpen(false); 
    setIsMenuOpen(false); 
    navigate(role === 'doctor' ? '/doctor/login' : '/user/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Navigation */}
     <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-blue-100 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-12 bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src={appLogo}
                alt="MyHealth Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-8">
            {['Services', 'Features', 'Our Mission', 'Contact'].map((item, index) => (
              <motion.a 
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {item}
              </motion.a>
            ))}
            <div className="relative">
              <motion.button 
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg font-medium"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                Get Started
              </motion.button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-blue-100 z-50"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.button
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      variants={dropdownItemVariants}
                      onClick={() => handleNavigation('doctor')}
                    >
                      As Doctor
                    </motion.button>
                    <motion.button
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      variants={dropdownItemVariants}
                      onClick={() => handleNavigation('user')}
                    >
                      As User
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <motion.button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6 text-blue-600" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6 text-blue-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="md:hidden bg-white border-t border-blue-100 shadow-lg overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="px-4 py-6 space-y-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {['Services', 'Features', 'Our Mission', 'Contact'].map((item, index) => (
                  <motion.a 
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="block py-3 text-gray-700 hover:text-blue-600 font-medium"
                    variants={fadeInUp}
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item}
                  </motion.a>
                ))}
                <div className="relative">
                  <motion.button 
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-full font-medium"
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    Get Started
                  </motion.button>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        className="w-full mt-2 bg-white rounded-lg shadow-xl border border-blue-100"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <motion.button
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          variants={dropdownItemVariants}
                          onClick={() => handleNavigation('doctor')}
                        >
                          As Doctor
                        </motion.button>
                        <motion.button
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          variants={dropdownItemVariants}
                          onClick={() => handleNavigation('user')}
                        >
                          As User
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="heroGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <motion.path 
                  d="M 60 0 L 0 0 0 60" 
                  fill="none" 
                  stroke="#2563EB" 
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut",
                    //  repeat: Infinity, repeatType: "loop" 
                    }}
                />
              </pattern>
              <radialGradient id="heroGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.05"/>
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#heroGrid)" />
            <rect width="100%" height="100%" fill="url(#heroGradient)" />
          </svg>
        </div>

        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 bg-blue-300 rounded-full blur-xl"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-32 h-32 bg-green-300 rounded-full blur-xl"
          animate={{ 
            y: [0, 30, 0],
            x: [0, -10, 0],
            scale: [1, 0.9, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-300 rounded-full blur-xl"
          animate={{ 
            y: [0, -15, 0],
            x: [0, 20, 0],
            opacity: [0.25, 0.4, 0.25]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 4 }}
        />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div 
            className="max-w-5xl mx-auto"
            style={{ y: heroY, opacity: heroOpacity }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div 
                    className="flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="h-28 bg-white rounded-xl shadow-lg overflow-hidden">
                    <img 
                        src={appLogo}
                        alt="MyHealth Logo"
                        className="w-full h-full object-cover"
                    />
                    </div>
                </motion.div>
              <motion.span 
                className="text-gray-800 text-4xl md:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              >
                Your Modern Healthcare Community
              </motion.span>
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto">
                <span className="font-semibold text-blue-700">"Connecting People, Doctors, and Health—All in One Place."</span><br />
                Your one-stop digital health platform for consultations, health monitoring, medical reports, and community care.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              <motion.button 
                className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-5 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl flex items-center"
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 25px 50px rgba(37, 99, 235, 0.4)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
                <motion.div
                  className="ml-3"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-6 w-6" />
                </motion.div>
              </motion.button>
              <motion.button 
                className="group border-2 border-blue-600 text-blue-600 px-10 py-5 rounded-full text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-lg flex items-center"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px rgba(37, 99, 235, 0.2)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Video className="mr-3 h-6 w-6" />
                Book Appointment
              </motion.button>
            </motion.div>

            {/* <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {[
                { number: "15K+", label: "Happy Patients", color: "text-blue-600" },
                { number: "800+", label: "Expert Doctors", color: "text-green-600" },
                { number: "24/7", label: "Support", color: "text-purple-600" },
                { number: "50+", label: "Specialities", color: "text-orange-600" }
              ].map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center group"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, delay: index * 0.2, repeat: Infinity }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div> */}

          </motion.div>
        </div>
      </section>

      {/* Why Choose MyHealth */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-25 to-gray-50">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="whyChoosePattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="1" fill="#3B82F6" opacity="0.1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#whyChoosePattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8">
              Why Choose MyHealth?
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              A <span className="font-semibold text-blue-600">safe, reliable, and modern healthcare ecosystem</span> designed for individuals, doctors, and communities.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: Video, title: "Easy Doctor Consultations & Report Analysises", desc: "Online appointments and health reports analysis with trusted professionals", color: "from-blue-500 to-blue-600" },
              { icon: Activity, title: "AI-Powered Health Monitoring", desc: "Smart insights and personalized health reports", color: "from-green-500 to-green-600" },
              { icon: Shield, title: "Secure Medical Records", desc: "Your health data protected with enterprise-grade security", color: "from-purple-500 to-purple-600" },
              { icon: MessageCircle, title: "Real-time Communications", desc: "Chat & video consultations with instant support", color: "from-orange-500 to-orange-600" },
              { icon: Newspaper, title: "Latest Health News & Blogs", desc: "Stay updated with verified healthcare information", color: "from-pink-500 to-pink-600" },
              { icon: CreditCard, title: "Transparent Payments & Refunds", desc: "Safe transactions with clear receipts and transparency", color: "from-indigo-500 to-indigo-600" }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 h-full"
              >
                <motion.div 
                  className={`bg-gradient-to-r ${feature.color} w-18 h-18 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle className="h-6 w-6 text-white mr-1" />
                  <feature.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Services */}
      <section id="services" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-25 to-purple-50">
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="servicesPattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M0,0 L200,200 M200,0 L0,200" stroke="#3B82F6" strokeWidth="1" opacity="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#servicesPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8">
              Our Core Services
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto">
              Comprehensive healthcare solutions designed to meet all your medical needs
            </p>
          </motion.div>

          <div className="space-y-20 max-w-7xl mx-auto">
            {[
              {
                icon: Stethoscope,
                title: "Online & Offline Doctor Consultations",
                desc: "Book appointments with trusted doctors near you or consult instantly via secure video calls. Access to specialist doctors across various medical fields.",
                features: ["Instant video consultations", "Local doctor booking", "Specialist access", "Flexible scheduling"],
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: BarChart3,
                title: "AI-Powered Health Reports & Free Health Status Monitoring",
                desc: "Submit your basic health data (sugar, BP, cholesterol, etc.) and get smart insights about your health status with personalized recommendations and periodic assessments.",
                features: ["Smart health analysis", "Trend monitoring", "Personalized insights", "Risk assessment"],
                color: "from-green-500 to-green-600"
              },
              {
                icon: FileText,
                title: "Expert Health Report Analysis",
                desc: "Upload lab tests or reports and get professional analysis and personalized advice from qualified medical professionals.",
                features: ["Professional analysis", "Detailed insights", "Personalized advice", "Quick turnaround"],
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: Newspaper,
                title: "Health News, Blogs & Free General Health Tips",
                desc: "Stay updated with verified healthcare news and insightful blogs from medical professionals. Get valuable health tips and general awareness regularly.",
                features: ["Latest health news", "Expert blogs", "Health tips", "Medical insights"],
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: BookOpen,
                title: "Free Journal Publications Platform",
                desc: "A free platform for doctors & researchers to publish medical journals and share knowledge with the healthcare community.",
                features: ["Free publishing", "Peer review", "Global reach", "Knowledge sharing"],
                color: "from-pink-500 to-pink-600"
              },
              {
                icon: ShoppingCart,
                title: "High-Quality Healthcare Products Store",
                desc: "A curated store offering only the best quality healthcare products, medications, and wellness items for users.",
                features: ["Quality assured", "Curated selection", "Easy ordering", "Fast delivery"],
                color: "from-indigo-500 to-indigo-600"
              },
              {
                icon: Globe,
                title: "Healthcare Centers Advertisement Platform",
                desc: "A dedicated space for healthcare centers to advertise their services to a targeted audience and connect with patients.",
                features: ["Targeted advertising", "Center promotion", "Patient connection", "Service visibility"],
                color: "from-teal-500 to-teal-600"
              }
            ].map((service, index) => (
              <motion.div 
                key={index}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 bg-white/90 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-xl hover:shadow-2xl transition-all duration-500`}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className="flex-1 text-center lg:text-left"
                  variants={index % 2 === 0 ? slideInLeft : slideInRight}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className={`bg-gradient-to-r ${service.color} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-lg`}
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.1,
                      transition: { duration: 0.6 }
                    }}
                  >
                    <service.icon className="h-10 w-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">{service.title}</h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">{service.desc}</p>
                  <motion.div 
                    className="grid grid-cols-2 gap-3"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {service.features.map((feature, idx) => (
                      <motion.div 
                        key={idx} 
                        className="flex items-center text-gray-700"
                        variants={fadeInUp}
                        whileHover={{ x: 5 }}
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="flex-1 max-w-md"
                  variants={index % 2 === 0 ? slideInRight : slideInLeft}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className={`bg-gradient-to-br ${service.color} rounded-2xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300`}
                    whileHover={{ 
                      rotate: 0,
                      scale: 1.05,
                      y: -10
                    }}
                    animate={{ 
                      rotate: [2, -2, 2],
                      transition: { duration: 4, repeat: Infinity }
                    }}
                  >
                    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                      <motion.div
                        animate={{ 
                          rotate: [0, 360],
                          transition: { duration: 20, repeat: Infinity, ease: "linear" }
                        }}
                      >
                        <service.icon className="h-16 w-16 text-white mx-auto mb-4" />
                      </motion.div>
                      <div className="text-white text-center">
                        <div className="text-sm opacity-90 mb-2">Available Now</div>
                        <div className="text-2xl font-bold">24/7 Service</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section id="our-mission" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-gray-50">
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="missionPattern" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
                <path d="M75 0 L75 150 M0 75 L150 75" stroke="#3B82F6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#missionPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8">
              Our Mission
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              To <span className="font-semibold text-blue-600">revolutionize healthcare</span> by making it accessible, efficient, and community-driven through innovative technology.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Heart,
                title: "Patient-Centric Care",
                desc: "Empowering patients with tools and knowledge to take control of their health.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Users,
                title: "Community Engagement",
                desc: "Building a supportive healthcare community for patients and professionals.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: Zap,
                title: "Innovative Technology",
                desc: "Leveraging AI and secure platforms to enhance healthcare delivery.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: Award,
                title: "Quality Assurance",
                desc: "Ensuring the highest standards in medical services and products.",
                color: "from-orange-500 to-orange-600"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <motion.div 
                  className={`bg-gradient-to-r ${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <item.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="testimonialsPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="2" fill="#3B82F6"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#testimonialsPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8">
              What Our Users Say
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto">
              Hear from our satisfied patients and healthcare professionals.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                name: "Dr. Sarah Johnson",
                role: "Cardiologist",
                quote: "MyHealth has transformed how I connect with my patients. The platform's secure video consultations and report analysis tools are game-changers.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Patient",
                quote: "The AI-powered health reports helped me understand my condition better and take proactive steps. The support team is always there when I need them!",
                rating: 4
              },
              {
                name: "Dr. Priya Sharma",
                role: "General Practitioner",
                quote: "Publishing my research on MyHealth's journal platform has been seamless. It's a fantastic way to share knowledge with the global medical community.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-200 rounded-full mr-4 flex-shrink-0"></div>
                  <div>
                    <div className="font-bold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-gray-50">
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pricingPattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M60 0 L60 120 M0 60 L120 60" stroke="#3B82F6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pricingPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8">
              Pricing Plans
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto">
              Choose a plan that suits your healthcare needs, with flexible options for everyone.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                title: "Basic",
                price: "Free",
                features: ["Health News & Blogs", "Basic Health Monitoring", "Community Access", "Limited Consultations"],
                color: "from-blue-500 to-blue-600",
                buttonText: "Get Started",
                popular: false
              },
              {
                title: "Pro",
                price: "Contact Us",
                features: ["Unlimited Consultations", "AI-Powered Reports", "Secure Medical Records", "Priority Support"],
                color: "from-green-500 to-green-600",
                buttonText: "Contact Sales",
                popular: true
              },
              {
                title: "Enterprise",
                price: "Custom",
                features: ["All Pro Features", "Dedicated Account Manager", "Journal Publishing", "Advertising Platform"],
                color: "from-purple-500 to-purple-600",
                buttonText: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className={`bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 relative ${plan.popular ? 'border-2 border-blue-600 shadow-xl' : ''}`}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{plan.title}</h3>
                <div className="text-4xl font-bold text-gray-800 mb-6">{plan.price}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <motion.button 
                  className={`w-full bg-gradient-to-r ${plan.color} text-white py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {plan.buttonText}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      {/* Contact Section */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="contactPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="1" fill="#3B82F6"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#contactPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8">
              Contact Us
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto">
              Have questions? Reach out to our team for support or inquiries.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              variants={slideInLeft}
              className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                  <span>123 Health Street, Wellness City, USA</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-blue-600 mr-3" />
                  <span>+1 (800) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-blue-600 mr-3" />
                  <span>support@myhealth.com</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={slideInRight}
              className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Send a Message</h3>
              <form className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <textarea 
                  placeholder="Your Message" 
                  rows={5} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
                <motion.button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 bg-white rounded-xl shadow-lg overflow-hidden">
                  <img 
                    src={appLogo}
                    alt="MyHealth Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* <span className="text-xl font-bold">MY HEALTH</span> */}
              </div>
              <p className="text-gray-200">Your modern healthcare community, connecting patients, doctors, and wellness.</p>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {['Services', 'Features', 'Our Mission', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-blue-200 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#health-news" className="hover:text-blue-200 transition-colors">Health News</a></li>
                <li><a href="#blogs" className="hover:text-blue-200 transition-colors">Blogs</a></li>
                <li><a href="#journal" className="hover:text-blue-200 transition-colors">Journal Publications</a></li>
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  123 Health Street, Wellness City, USA
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  +1 (800) 123-4567
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  support@myhealth.com
                </li>
              </ul>
            </motion.div>
          </motion.div>

          <motion.div 
            className="mt-12 pt-8 border-t border-blue-500/50 text-center"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p>&copy; {new Date().getFullYear()} MyHealth. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;