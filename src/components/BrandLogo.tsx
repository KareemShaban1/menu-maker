import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { cn } from "@/lib/utils";

const BrandLogo = ({ className = "h-10 w-10" }: { className?: string }) => {
  const { settings } = useSiteSettings();
  const logoUrl = settings.brand.logoUrl;

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={settings.brand.name}
        className={cn("object-contain rounded-md", className)}
      />
    );
  }

  return (
    <svg viewBox="0 0 32 32" className={cn("rounded-md", className)} aria-hidden="true">
      <rect width="32" height="32" rx="6" fill={settings.theme.primary || "#c52020"} />
      <rect x="1.5" y="1.5" width="29" height="29" rx="5" fill="none" stroke="#1b120e" strokeWidth="1.5" />
      <path
        d="M8.5 11.2c2.4-.9 4.6-.7 7.5.5 2.9-1.2 5.1-1.4 7.5-.5v10.2c-2.4-.9-4.6-.7-7.5.5-2.9-1.2-5.1-1.4-7.5-.5V11.2Z"
        fill="none"
        stroke="#f7f2e9"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M16 11.7v10.2" stroke="#f7f2e9" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export default BrandLogo;
