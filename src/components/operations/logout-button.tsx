"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/** Signs out through the existing Supabase Auth client, same as the sidebar. */
export function LogoutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await createClient().auth.signOut();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={signingOut}
      aria-label="Log out"
    >
      <LogOut aria-hidden="true" />
      <span className="hidden sm:inline">{signingOut ? "Logging out…" : "Log out"}</span>
    </Button>
  );
}
