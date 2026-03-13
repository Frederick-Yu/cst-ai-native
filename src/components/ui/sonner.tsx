"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "bg-white border border-stone-200 text-stone-800 shadow-md",
          title: "text-stone-800 font-medium",
          description: "text-stone-500 text-sm",
          success: "border-teal-200 bg-teal-50 text-teal-800",
          error: "border-rose-200 bg-rose-50 text-rose-800",
        },
      }}
      {...props}
    />
  );
}
