"use client";

import { useState, useTransition } from "react";
import { requestPasswordReset } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return (
      <Card className="p-6">
        <CardBody className="p-0 text-center space-y-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent-deep dark:text-accent">
            <svg
              viewBox="0 0 20 20"
              className="h-5 w-5"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            Check your inbox
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            If an account exists for that email, you&apos;ll get a recovery
            link shortly. The link expires in 1 hour.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardBody className="p-0 space-y-4">
        <form
          action={(formData) => {
            startTransition(async () => {
              // Always returns success — account-enumeration defense means
              // the action never reveals whether the email was valid or
              // rate-limited. Show the "check your inbox" view regardless.
              await requestPasswordReset(formData);
              setSent(true);
            });
          }}
          className="space-y-4"
        >
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

          <Button type="submit" loading={isPending} className="w-full">
            {isPending ? "Sending…" : "Send recovery link"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
