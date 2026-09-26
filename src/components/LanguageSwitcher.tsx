import { Check, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-card">
          <Languages className="w-4 h-4 text-primary" />
          <span>{language === "en" ? "EN" : "عربي"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuItem onClick={() => setLanguage("en")} className="gap-2">
          <Check className={`w-4 h-4 ${language === "en" ? "opacity-100" : "opacity-0"}`} />
          <span className={language === "en" ? "font-semibold" : ""}>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("ar")} className="gap-2">
          <Check className={`w-4 h-4 ${language === "ar" ? "opacity-100" : "opacity-0"}`} />
          <span className={language === "ar" ? "font-semibold" : ""}>العربية</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
