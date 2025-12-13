"use client";

import { ReactNode, useEffect } from "react";

import { cn } from "@/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
}

export const Modal = ({ isOpen, onClose, title, description, children, size = "md", showCloseButton = true }: ModalProps) => {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative z-50">
      {/* Backdrop */}
      <div className={cn("fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} />

      {/* Modal Container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4" onClick={handleBackdropClick}>
          {/* Modal Panel */}
          <div
            className={cn("w-full transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300", sizes[size], isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95")}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {title && <h2 className="text-xl font-bold text-primary-900">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-primary-600">{description}</p>}
                </div>
                {showCloseButton && (
                  <button onClick={onClose} className="ml-4 transition-colors text-primary-400 hover:text-primary-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            {/* Content */}
            <div className="mt-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
