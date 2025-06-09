"use client";

import { CV_THEMES, CVTheme } from "@/lib/cv-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Palette } from "lucide-react";

interface CVThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
}

export default function CVThemeSelector({
  selectedTheme,
  onThemeChange,
}: CVThemeSelectorProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5" />
          <h3 className="text-lg font-semibold">CV Theme</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CV_THEMES.map((theme: CVTheme) => (
            <ThemePreviewCard
              key={theme.id}
              theme={theme}
              isSelected={selectedTheme === theme.id}
              onClick={() => onThemeChange(theme.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ThemePreviewCardProps {
  theme: CVTheme;
  isSelected: boolean;
  onClick: () => void;
}

function ThemePreviewCard({
  theme,
  isSelected,
  onClick,
}: ThemePreviewCardProps) {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className="h-auto p-3 flex flex-col items-start gap-2 relative min-h-[100px] w-full"
      onClick={onClick}
    >
      {isSelected && (
        <div className="absolute top-2 right-2">
          <Check className="w-4 h-4" />
        </div>
      )}
      {/* Color Preview */}
      <div className="w-full h-8 rounded-md flex overflow-hidden">
        <div
          className="flex-1"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div
          className="flex-1"
          style={{ backgroundColor: theme.colors.accent }}
        />
        <div
          className="flex-1"
          style={{ backgroundColor: theme.colors.background }}
        />
      </div>{" "}
      {/* Theme Info */}
      <div className="text-left w-full min-w-0">
        <div className="font-medium text-sm truncate">{theme.name}</div>
        <div className="text-xs text-muted-foreground line-clamp-2 leading-tight break-words">
          {theme.description}
        </div>
      </div>
    </Button>
  );
}
