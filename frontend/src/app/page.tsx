"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Stethoscope, Calendar, Brain, CreditCard, ArrowRight } from "lucide-react";

const mainFeatures = [
  { href: "/doctors", label: "Find Doctors", icon: Stethoscope, desc: "Connect with specialized health professionals instantly." },
  { href: "/ai", label: "AI Suggestion", icon: Brain, desc: "Get real-time insights based on your symptoms powered by AI." },
  { href: "/booking", label: "Booking", icon: Calendar, desc: "Schedule and manage your appointments seamlessly." },
];

const secondaryLinks = [
  { href: "/login", label: "Patient Login", icon: Activity },
  { href: "/signup", label: "Create Account", icon: Activity },
  { href: "/payments", label: "Billing & Payments", icon: CreditCard },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute -top-24 right-1/4 -z-10 h-[20rem] w-[20rem] rounded-full bg-purple-500/20 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="mb-8 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-300 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse mr-2" />
          Next-Gen AI Healthcare
        </div>
        <h1 className="bg-gradient-to-vr from-white to-gray-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent drop-shadow-sm sm:text-7xl">
          Intelligent Health Consultation
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-300">
          Experience the future of medical care. Seamlessly connect with top doctors or leverage our cutting-edge AI for instant preliminary insights, all in one secure platform.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mt-16 grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {mainFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div key={feature.label} variants={itemVariants} className="group relative">
              <Link href={feature.href}>
                <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-300 hover:border-blue-500/50 hover:bg-white/10 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                      {feature.label}
                    </h3>
                    <p className="mt-2 text-sm text-gray-400">
                      {feature.desc}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center text-sm font-medium text-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Explore <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-16 flex flex-wrap items-center justify-center gap-4"
      >
        {secondaryLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.label} href={link.href}>
              <div className="flex items-center rounded-full border border-white/10 bg-black/20 px-6 py-2.5 text-sm font-medium text-gray-300 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white">
                <Icon className="mr-2 h-4 w-4" />
                {link.label}
              </div>
            </Link>
          );
        })}
      </motion.div>
    </main>
  );
}
