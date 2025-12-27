// Simplified toast hook for demo purposes
import { useState } from "react";

export interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = ({ title, description, variant }: Toast) => {
    // Simple console.log for now, replace with actual toast implementation
    console.log(`[Toast ${variant || "default"}]`, title, description);

    // In a real implementation, this would trigger a toast notification
    // For now, using browser alert as fallback
    if (variant === "destructive") {
      alert(`❌ ${title}${description ? `\n${description}` : ""}`);
    } else {
      alert(`✅ ${title}${description ? `\n${description}` : ""}`);
    }
  };

  return { toast };
}
