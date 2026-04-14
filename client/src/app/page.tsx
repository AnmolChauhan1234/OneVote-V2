"use client";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Fingerprint,
  Scan,
  CheckCircle,
  Sparkles,
  Users,
  Clock,
  Globe,
  Star,
  ChevronRight,
  Lock,
  Zap,
  TrendingUp,
  Vote,
  Building2,
  Award,
  Heart,
  Quote,
} from "lucide-react";

import { BottomHeader } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";

import { TestimonialCard } from "@/components/ui/Testimonial";

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const stats = [
    { value: "100%", label: "Vote Accuracy", icon: Shield },
    { value: "< 2s", label: "Verification Speed", icon: Zap },
    { value: "5K+", label: "Votes Supported", icon: Users },
    { value: "50+", label: "Organizations", icon: Building2 },
  ];

  const features = [
    {
      icon: Fingerprint,
      title: "Biometric Authentication",
      description:
        "Facial recognition and liveness detection for secure voter verification.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Scan,
      title: "Identity Verification",
      description: "Government ID validation with real-time document scanning.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Secure by Design",
      description:
        "End-to-end encryption protecting every vote from cast to count.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Lock,
      title: "Audit Trail",
      description:
        "Complete transparency with verifiable audit logs for every vote.",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Register Voters",
      description: "Add eligible voters and verify their identities",
      icon: Users,
    },
    {
      step: "02",
      title: "Create Election",
      description: "Set up positions, candidates, and voting period",
      icon: Vote,
    },
    {
      step: "03",
      title: "Cast & Count",
      description: "Secure voting with instant, verifiable results",
      icon: CheckCircle,
    },
  ];

  const testimonials = [
    {
      name: "Maki Zenin",
      role: "Election Coordinator, Jujutsu High",
      content:
        "OneVote made our Zenin council elections completely transparent. The biometric verification eliminated fraud completely.",
      rating: 5,
      image: "/maki.jpg",
      organization: "Educational Institution",
    },
    {
      name: "Yuki Tsukumo",
      role: "Executive Director, Star Plasma Voters",
      content:
        "Managing 5000+ voters has never been easier. The platform scales perfectly and the support high cursed energy output.",
      rating: 5,
      image: "/yuki.jpg",
      organization: "Non-Profit Organization",
    },
    {
      name: "Yoriichi Tsugikuni",
      role: "Board Chairman, Gotei 13",
      content:
        "The security features give us complete confidence in our election results. A game-changer for Soul Society democracy.",
      rating: 5,
      image: "/yorichi.jpg",
      organization: "Corporate Board",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-white overflow-x-hidden font-sans"
    >
      <BottomHeader />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-30"
            animate={floatingAnimation}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full blur-3xl opacity-30"
            animate={{
              y: [0, 15, 0],
              transition: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              },
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-50 to-purple-50 rounded-full blur-3xl opacity-20"
            animate={{
              scale: [1, 1.1, 1],
              transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        </div>

        <motion.div
          className="fixed w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none z-0"
          animate={{
            x: mousePosition.x - 300,
            y: mousePosition.y - 300,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full mb-6 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span className="text-[10px] uppercase tracking-wider text-black/70 font-medium">
                Perfect for Organizations & Institutions
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-black mb-6 font-display"
              style={{ y, opacity }}
            >
              Simple, Secure
              <br />
              <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                Digital Voting
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ y, opacity }}
            >
              OneVote delivers secure, transparent digital voting for
              organizations, institutions, and communities of up to 5,000+
              voters.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              style={{ y, opacity }}
            >
              <Link href="/register">
                <PrimaryButton
                  variant="dark"
                  startIcon={<ArrowRight className="w-4 h-4" />}
                  className="px-8 py-3"
                >
                  Start Free Trial
                </PrimaryButton>
              </Link>
              <Link href="/demo">
                <SecondaryButton variant="light" className="px-8 py-3">
                  Watch Demo
                </SecondaryButton>
              </Link>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  className="text-center cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-black" />
                  <div className="text-2xl md:text-3xl font-bold text-black font-display">
                    {stat.value}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-muted mt-1 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-black/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-black/50 rounded-full mt-2 animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-medium">
              Why Choose OneVote
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black mt-4 mb-4 font-display">
              Enterprise Features, Simple Pricing
            </h2>
            <p className="text-secondary max-w-2xl mx-auto leading-relaxed">
              Everything you need to run fair and transparent elections
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group relative bg-white border border-border rounded-sm p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-sm flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2 font-display">
                  {feature.title}
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute inset-0 border border-black/0 group-hover:border-black/10 transition-all duration-300 rounded-sm pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-soft relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-medium">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black mt-4 mb-4 font-display">
              How OneVote Works
            </h2>
            <p className="text-secondary max-w-2xl mx-auto leading-relaxed">
              Three simple steps to run your election
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {howItWorks.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center cursor-pointer"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center text-xs font-bold font-display">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2 font-display">
                  {item.title}
                </h3>
                <p className="text-secondary leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full blur-3xl opacity-20"
            animate={floatingAnimation}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-medium">
              Trusted by Leaders
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black mt-4 mb-4 font-display">
              What Our Clients Say
            </h2>
            <p className="text-secondary max-w-2xl mx-auto leading-relaxed">
              Join hundreds of organizations already using OneVote
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard
                key={testimonial.name}
                testimonial={testimonial}
                index={idx}
              />
            ))}
          </div>

          {/* Trust Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-soft rounded-full">
              <Heart className="w-4 h-4 text-black" />
              <span className="text-[10px] uppercase tracking-wider text-black/70 font-medium">
                Trusted by 50+ Organizations Worldwide
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-black to-gray-900 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-4 font-display"
          >
            Ready to Run Your Election?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-gray-300 text-lg mb-8 leading-relaxed"
          >
            Join organizations using OneVote for secure, transparent digital
            elections
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link href="/register">
              <PrimaryButton
                variant="light"
                startIcon={<TrendingUp className="w-4 h-4" />}
                className="px-8 py-3"
              >
                Start Free Trial
              </PrimaryButton>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
