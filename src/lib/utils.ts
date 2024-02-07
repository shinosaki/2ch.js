import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const LS = {
  get: (key, fallbackValue = null) => JSON.parse(localStorage.getItem(key) ?? `${fallbackValue}`),
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
}