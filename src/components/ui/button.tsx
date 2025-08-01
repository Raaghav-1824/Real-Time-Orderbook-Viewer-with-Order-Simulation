import { cn } from "@/lib/utils/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'buy' | 'sell' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
          "disabled:pointer-events-none disabled:opacity-50",
          
          // Variants
          {
            'bg-emerald-500 text-white hover:bg-emerald-500': variant === 'primary',
            'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600': variant === 'secondary',
            'bg-emerald-500 text-white hover:bg-emerald-600': variant === 'buy',
            'bg-red-500 text-white hover:bg-red-600': variant === 'sell',
            'text-gray-300 hover:text-white hover:bg-gray-800': variant === 'ghost',
          },
          
          // Sizes
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };