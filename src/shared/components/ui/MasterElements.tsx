/** Job Mitra | MasterElements.tsx | src/shared/components/ui/MasterElements.tsx */

import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={joinClassNames(
        "wm-masterButton",
        `wm-masterButton-${variant}`,
        `wm-masterButton-${size}`,
        className,
      )}
    />
  );
}

export function TextField({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={joinClassNames("wm-masterTextField", className)} />;
}

function joinClassNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(" ");
}
