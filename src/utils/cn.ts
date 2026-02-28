// ============================================================
// utils/cn.ts
// Tailwind class merging utility using clsx + tailwind-merge.
// Usage: cn("px-4 py-2", isActive && "bg-indigo-600", className)
// ============================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]): string =>
  twMerge(clsx(inputs));
