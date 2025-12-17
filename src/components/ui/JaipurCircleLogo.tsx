import { cn } from "@/lib/utils";

interface JaipurCircleLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const JaipurCircleLogo = ({ className, size = "md" }: JaipurCircleLogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <span className={cn("font-bold tracking-tight", sizeClasses[size], className)}>
      <span className="text-[#C41E5C]">Jaipur</span>
      <span className="bg-gradient-to-r from-[#E85D2D] to-[#F59E0B] bg-clip-text text-transparent">Circle</span>
      <span className="text-[#F59E0B]">.</span>
    </span>
  );
};

export default JaipurCircleLogo;
