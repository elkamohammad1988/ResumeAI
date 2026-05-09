"use client";

import { useState, useTransition } from "react";
import { signUpWithPassword } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="p-6">
      <CardBody className="p-0 space-y-4">
        <form
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              const res = await signUpWithPassword(formData);
              if (res?.error) setError(res.error);
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
              Full name
            </label>
            <Input name="name" type="text" required minLength={2} placeholder="Jane Doe" />
          </div>
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
            <label className="block mb-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
              Password
            </label>
            <Input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="px-3 py-2 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" loading={isPending} className="w-full">
            {isPending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
