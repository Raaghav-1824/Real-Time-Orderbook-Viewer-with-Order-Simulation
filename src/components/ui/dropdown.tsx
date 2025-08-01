"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Dropdown({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  disabled = false,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between",
          "px-3 py-2 text-sm",
          "bg-gray-800 border border-gray-700 rounded-md",
          "text-gray-200 placeholder-gray-500",
          "hover:border-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500",
          "transition-colors duration-200",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "border-emerald-500 ring-1 ring-emerald-500"
        )}
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon}
          <span className={cn(
            selectedOption ? "text-gray-200" : "text-gray-500"
          )}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          "absolute z-50 w-full mt-1",
          "bg-gray-800 border border-gray-700 rounded-md shadow-lg",
          "max-h-60 overflow-auto"
        )}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => !option.disabled && handleSelect(option.value)}
              disabled={option.disabled}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm text-left",
                "hover:bg-gray-700 focus:bg-gray-700 focus:outline-none",
                "transition-colors duration-150",
                option.disabled && "opacity-50 cursor-not-allowed",
                value === option.value && "bg-emerald-500/10 text-emerald-400"
              )}
            >
              <div className="flex items-center gap-2">
                {option.icon}
                <span>{option.label}</span>
              </div>
              {value === option.value && (
                <Check className="h-4 w-4 text-emerald-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}