"use client";

import { ReactNode, useState, useRef, useEffect } from "react";

import { cn } from "@/utils";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  position?: string;
}

export const Dropdown = ({ trigger, children, align = "right", position = "origin-top" }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative inline-block w-full text-left">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      <div
        className={cn(
          "absolute z-10 mt-2 w-56 rounded bg-white shadow-lg focus:outline-none overflow-hidden transition-all duration-100",
          align === "right" ? "right-0" : "left-0",
          position,
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {children}
      </div>
    </div>
  );
};

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  danger?: boolean;
}

export const DropdownItem = ({ children, onClick, icon, danger }: DropdownItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn("group flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors", isHovered && "bg-primary-50", danger ? "text-red-600" : "text-primary-900")}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export const DropdownDivider = () => {
  return <div className="h-px my-1 bg-primary-100" />;
};
