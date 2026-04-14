"use client";

import Link from "next/link";
import { Stethoscope, Mail, Phone, MapPin, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <Stethoscope className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">MediCare</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-gray-500">
              Your health, our priority. Connect with top doctors and manage your healthcare journey.
            </p>
          </div>

          <div className="flex gap-8 text-sm">
            <div>
              <h4 className="font-medium text-white">Quick Links</h4>
              <ul className="mt-2 space-y-1 text-gray-500">
                <li><Link href="/doctors" className="hover:text-emerald-400">Find Doctors</Link></li>
                <li><Link href="/ai" className="hover:text-emerald-400">AI Consultation</Link></li>
                <li><Link href="/booking" className="hover:text-emerald-400">Book Appointment</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white">Legal</h4>
              <ul className="mt-2 space-y-1 text-gray-500">
                <li><Link href="/privacy" className="hover:text-emerald-400">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-emerald-400">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-gray-500">
          <p>&copy; 2024 MediCare Hub. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Secure Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
