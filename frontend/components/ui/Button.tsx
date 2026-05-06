import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "warning";
type ButtonSize = "sm" | "md" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary: "border-primary bg-primary text-white shadow-sm shadow-blue-200 hover:bg-blue-700",
  secondary: "border-borderSoft bg-white text-ink hover:border-blue-200 hover:bg-blue-50",
  ghost: "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-ink",
  danger: "border-red-200 bg-red-50 text-danger hover:bg-red-100",
  success: "border-green-200 bg-green-50 text-success hover:bg-green-100",
  warning: "border-amber-200 bg-amber-50 text-warning hover:bg-amber-100"
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm md:text-base"
};

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  children,
  href,
  type = "button",
  variant = "secondary",
  size = "md",
  className = "",
  onClick,
  disabled = false
}: ButtonProps) {
  const classes = `inline-flex shrink-0 items-center justify-center gap-2 rounded-control border font-extrabold transition duration-150 ease-out ${sizeClass[size]} ${variantClass[variant]} ${disabled ? "cursor-not-allowed opacity-55" : ""} ${className}`;

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
