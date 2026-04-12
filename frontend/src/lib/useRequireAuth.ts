"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";

export const useRequireAuth = () => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthorized(true);
  }, [router]);

  return authorized;
};
