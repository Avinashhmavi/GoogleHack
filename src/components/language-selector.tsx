
"use client";

import { useLanguage } from "@/context/language-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { value: "en", label: "English" },
    { value: "hi", label: "हिन्दी" }, // Hindi
    { value: "bn", label: "বাংলা" }, // Bengali
    { value: "ta", label: "தமிழ்" }, // Tamil
    { value: "te", label: "తెలుగు" }, // Telugu
    { value: "kn", label: "ಕನ್ನಡ" }, // Kannada
  ];

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-auto gap-2 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md">
        <Languages className="w-4 h-4" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent className="transition-all duration-200">
        {languages.map((lang) => (
          <SelectItem 
            key={lang.value} 
            value={lang.value}
            className="transition-all duration-200 hover:bg-accent/80 cursor-pointer"
          >
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
