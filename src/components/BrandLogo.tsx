import { useId } from "react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { cn } from "@/lib/utils";

const BrandLogo = ({ className = "h-10 w-10" }: { className?: string }) => {
  const rawId = useId().replace(/:/g, "");
  const gradientId = `carta-${rawId}`;
  const { settings } = useSiteSettings();
  const logoUrl = settings.brand.logoUrl;

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={settings.brand.name}
        className={cn("object-contain rounded-lg", className)}
      />
    );
  }

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor={settings.theme.primary} />
          <stop offset="1" stopColor={settings.theme.accent} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`} />
      <path
        d="M8.5 11.2c2.4-.9 4.6-.7 7.5.5 2.9-1.2 5.1-1.4 7.5-.5v10.2c-2.4-.9-4.6-.7-7.5.5-2.9-1.2-5.1-1.4-7.5-.5V11.2Z"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M16 11.7v10.2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
};

export default BrandLogo;
