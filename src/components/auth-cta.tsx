"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function AuthCTA({ size = "default" }: { size?: "default" | "large" }) {
  const { data: session } = useSession();
  const router = useRouter();

  function handleClick() {
    if (session) {
      router.push("/dashboard");
    } else {
      signIn("reddit", { callbackUrl: "/dashboard" });
    }
  }

  if (size === "large") {
    return (
      <Button
        size="lg"
        onClick={handleClick}
        className="group h-14 gap-2 bg-primary px-10 text-lg text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30"
      >
        {session ? "Go to Dashboard" : "Get Started Free"}
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowRight className="h-5 w-5" />
        </motion.span>
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      onClick={handleClick}
      className="group h-12 gap-2 bg-primary px-8 text-base text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30"
    >
      {session ? "Go to Dashboard" : "Start Free"}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Button>
  );
}
