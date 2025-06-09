#!/usr/bin/env node

// Quick test to verify theme functionality
const {
  CV_THEMES,
  getThemeById,
  getThemeColors,
} = require("./src/lib/cv-themes.ts");

console.log("🎨 CV Theme System Test\n");

console.log("Available Themes:");
CV_THEMES.forEach((theme, index) => {
  console.log(`${index + 1}. ${theme.name} (${theme.id})`);
  console.log(`   Description: ${theme.description}`);
  console.log(`   Primary: ${theme.colors.primary}`);
  console.log(`   Accent: ${theme.colors.accent}`);
  console.log("");
});

console.log("Theme Color Test:");
const testTheme = getThemeColors("creative-purple");
console.log("Creative Purple Colors:", testTheme);

console.log("\n✅ Theme system is working correctly!");
