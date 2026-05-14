"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInWithPassword } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="p-6">
      <CardBody className="p-0 space-y-4">
        <form
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              const res = await signInWithPassword(formData);
              if (res?.error) setError(res.error);
            });
          }}
          className="space-y-4"
        >
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="block mb-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
              Email
            </label>
            <Input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-accent-deep dark:hover:text-accent normal-case tracking-normal"
              >
                Forgot?
              </Link>
            </div>
            <Input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="px-3 py-2 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" loading={isPending} className="w-full">
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
