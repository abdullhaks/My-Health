import React from "react";

interface ButtonProps {
  text: string;
  onClick?: () => any;
  type?: "button" | "submit";
  className?: string;
  width?: string;
  height?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  type = "button",
  className = "",
  width = "w-full",
  height = "h-12",
  disabled = false,
  icon
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${width} ${height} flex items-center justify-center gap-2  rounded-lg  transition duration-300 disabled:opacity-50 ${className}`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {text}
    </button>
  );
};

export default Button;
