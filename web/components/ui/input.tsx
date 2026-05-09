import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full px-3 py-2.5 text-sm rounded-lg transition",
        "bg-white border border-zinc-300 placeholder:text-zinc-400",
        "dark:bg-zinc-950 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-600",
        "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  );
});
