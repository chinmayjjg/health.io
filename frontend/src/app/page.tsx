"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Calendar,
  FileText,
  Pill,
  Heart,
  AlertCircle,
  ArrowRight,
  Users,
  Award,
  Clock,
  CheckCircle,
  Video,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Virtual Consultations",
    desc: "Consult with licensed doctors from the comfort of your home via video calls. Available 24/7 for urgent care.",
    link: "/doctors",
  },
  {
    icon: Calendar,
    title: "Easy Appointment Booking",
    desc: "Easily schedule in-person or virtual appointments with specialists in various fields of medicine.",
    link: "/booking",
  },
  {
    icon: FileText,
    title: "Health Records",
    desc: "Store and access your medical history, test results, and prescriptions in one secure digital vault.",
    link: "/records",
  },
  {
    icon: Stethoscope,
    title: "Find Doctors",
    desc: "Browse and filter through hundreds of verified doctors based on specialization, location, and availability.",
    link: "/doctors",
  },
  {
    icon: Heart,
    title: "Health Monitoring",
    desc: "Track vital signs, receive personalized health insights, and get alerts for potential health issues.",
    link: "/health",
  },
  {
    icon: AlertCircle,
    title: "Emergency Services",
    desc: "Quick access to emergency contacts and real-time guidance for critical situations.",
    link: "/emergency",
  },
];

const stats = [
  { value: "50K+", label: "Happy Patients", icon: Users },
  { value: "500+", label: "Expert Doctors", icon: Award },
  { value: "24/7", label: "Support Available", icon: Clock },
  { value: "99%", label: "Satisfaction Rate", icon: Heart },
];

const whyChooseUs = [
  {
    icon: Shield,
    title: "Verified Doctors",
    desc: "All our doctors are verified and licensed professionals",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    desc: "Book appointments at your convenience",
  },
  { icon: Video, title: "Virtual Care", desc: "Get consultations from anywhere" },
  {
    icon: Heart,
    title: "Patient-First",
    desc: "Your health and comfort is our priority",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex min-h-screen w-full items-center justify-center px-4 py-32">
        {/* Background Effects */}
        <div className="absolute left-1/4 top-1/4 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-[25rem] w-[25rem] rounded-full bg-teal-500/20 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-5xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 backdrop-blur-sm"
          >
            <span className="mr-2 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Your Health, Our Priority
          </motion.div>

          <h1 className="bg-gradient-to-r from-white via-emerald-100 to-gray-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent drop-shadow-sm sm:text-6xl lg:text-7xl">
            Advanced Healthcare
            <br className="hidden sm:block" /> at Your Fingertips
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 sm:text-xl">
            Connect with top doctors, book appointments, and manage your health records
            securely. Experience the future of telemedicine with MediCare Hub.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/doctors"
              className="group inline-flex items-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-600 hover:scale-105"
            >
              Find a Doctor
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/ai"
              className="group inline-flex items-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10"
            >
              <Stethoscope className="mr-2 h-4 w-4" />
              AI Consultation
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/5 bg-black/20 py-12">
        <div className="mx-auto flex max-w-6xl grid-cols-2 flex-wrap items-center justify-center gap-8 px-4 sm:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                  <Icon className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full px-4 py-24" id="services">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl font-bold text-white">Our Services</h2>
            <p className="mt-4 text-gray-400">
              Comprehensive healthcare solutions tailored to your needs
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={itemVariants} className="group">
                  <Link href={feature.link}>
                    <div className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 hover:bg-white/10 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-400">{feature.desc}</p>
                      </div>
                      <div className="mt-4 flex items-center text-sm font-medium text-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        Learn more <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full border-y border-white/5 bg-black/20 px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white">Why Choose MediCare Hub?</h2>
              <p className="mt-4 text-gray-400">
                We combine cutting-edge technology with compassionate care to provide you
                with the best healthcare experience possible.
              </p>
              <div className="mt-8 space-y-4">
                {whyChooseUs.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                        <Icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        <p className="text-sm text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Medical team"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 rounded-lg bg-black/40 backdrop-blur-md p-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm font-medium text-white">
                      Verified Healthcare Platform
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 md:p-12"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Ready to Transform Your Healthcare Experience?
            </h2>
            <p className="mt-4 text-lg text-emerald-100">
              Join thousands of satisfied users who have made MediCare Hub their go-to
              health companion.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-600 transition-all hover:bg-gray-100"
              >
                Get Started Free
              </Link>
              <Link
                href="/doctors"
                className="inline-flex items-center rounded-lg border-2 border-white px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                Browse Doctors
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
