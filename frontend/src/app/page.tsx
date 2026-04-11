import Link from "next/link";

const links = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Signup" },
  { href: "/doctors", label: "Doctors" },
  { href: "/booking", label: "Booking" },
  { href: "/ai", label: "AI Suggestion" },
  { href: "/payments", label: "Payments" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Health Consultation Frontend</h1>
      <p className="text-center text-gray-600">
        Day 23 routing setup is ready. Use the links below to navigate.
      </p>
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md border p-3 text-center text-sm font-medium hover:bg-gray-100"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
