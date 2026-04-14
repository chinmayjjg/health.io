export default function TermsPage() {
  return (
    <main className="min-h-screen pt-20 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-emerald max-w-none">
        <p className="mb-4">Last updated: April 2026</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using this platform, you accept and agree to be bound by the
          terms and provision of this agreement.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Medical Disclaimer</h2>
        <p className="mb-4">
          This platform provides AI-assisted health consultation for informational
          purposes only. It is not a substitute for professional medical advice,
          diagnosis, or treatment.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Privacy</h2>
        <p className="mb-4">
          Your personal health information is protected in accordance with our privacy
          policy. We do not share your data with third parties.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. User Responsibilities</h2>
        <p className="mb-4">
          You agree to provide accurate information and use the platform responsibly.
        </p>
      </div>
    </main>
  );
}
