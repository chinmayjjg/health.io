"use client";

import Link from "next/link";
import { Stethoscope, Calendar, FileText, Heart, AlertCircle, ArrowRight, Users, Award, Clock } from "lucide-react";

const features = [
  { icon: Stethoscope, title: "Find Doctors", desc: "Browse and filter through verified doctors", link: "/doctors" },
  { icon: Calendar, title: "Book Appointment", desc: "Schedule visits with available time slots", link: "/booking" },
  { icon: FileText, title: "Health Records", desc: "Store and access your medical history", link: "/records" },
  { icon: Heart, title: "Health Monitoring", desc: "Track vital signs and health insights", link: "/health" },
];

export default function Home() {
  return (
    <main className="min-h-screen pt-14">
      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-900/30 via-gray-950 to-gray-950"></div>
        
        <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          Advanced Healthcare<br />at Your Fingertips
        </h1>
        <p className="mt-4 max-w-xl text-gray-400 text-lg">
          Connect with top doctors, book appointments, and manage your health records securely.
        </p>
        
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/doctors" className="flex items-center rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">
            Find a Doctor
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/ai" className="flex items-center rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10">
            AI Consultation
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-black/30 py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-8 px-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">50K+</div>
            <div className="text-sm text-gray-500">Patients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">500+</div>
            <div className="text-sm text-gray-500">Doctors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">24/7</div>
            <div className="text-sm text-gray-500">Support</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-white mb-4">Our Services</h2>
        <p className="text-center text-gray-500 mb-10">Comprehensive healthcare solutions</p>
        
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} href={feature.link} className="group rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-emerald-500/50">
                <Icon className="h-8 w-8 text-emerald-400" />
                <h3 className="mt-3 font-semibold text-white">{feature.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{feature.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to Get Started?</h2>
          <p className="mt-2 text-emerald-100">Join thousands of users who trust MediCare Hub</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/signup" className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-gray-100">
              Sign Up
            </Link>
            <Link href="/doctors" className="rounded-lg border-2 border-white px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              Browse Doctors
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
