"use client";

import { useState, useTransition } from "react";
import { updatePassword } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="p-6">
      <CardBody className="p-0 space-y-4">
        <form
          action={(formData) => {
            setError(null);
            const pw = String(formData.get("password") ?? "");
            const confirm = String(formData.get("confirm") ?? "");
            if (pw !== confirm) {
              setError("Passwords don't match.");
              return;
            }
            startTransition(async () => {
              const res = await updatePassword(formData);
              if (res?.error) setError(res.error);
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
              New password
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
          <div>
            <label className="block mb-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
              Confirm new password
            </label>
            <Input
              name="confirm"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Retype the password"
            />
          </div>

          {error && (
            <p className="px-3 py-2 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" loading={isPending} className="w-full">
            {isPending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
