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
  ];

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-auto gap-2">
        <Languages className="w-4 h-4" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
