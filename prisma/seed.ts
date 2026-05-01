import { prisma } from "@/lib";

import { CURRENCY_LOCALE_MAP, CURRENCY_OPTIONS, LANGUAGE_OPTIONS, THEME_OPTIONS, ZERO_DECIMAL_CURRENCIES } from "@/static";

async function main() {
  console.log("🌱 Starting database seeding...\n");
  // ============================================
  // 1. CREATE DEFAULT APP SETTINGS
  // ============================================
  const APP_SETTINGS = [
    {
      key: "currency_options",
      value: JSON.stringify(CURRENCY_OPTIONS),
      type: "json",
      category: "appearance",
      label: "Currency Options",
      description: "Available currency options for user selection",
      isPublic: true,
    },
    {
      key: "language_options",
      value: JSON.stringify(LANGUAGE_OPTIONS),
      type: "json",
      category: "appearance",
      label: "Language Options",
      description: "Available language options for user selection",
      isPublic: true,
    },
    {
      key: "theme_options",
      value: JSON.stringify(THEME_OPTIONS),
      type: "json",
      category: "appearance",
      label: "Theme Options",
      description: "Available theme options for user selection",
      isPublic: true,
    },
    {
      key: "currency_locale_map",
      value: JSON.stringify(CURRENCY_LOCALE_MAP),
      type: "json",
      category: "system",
      label: "Currency Locale Map",
      description: "Mapping of currency to locale for formatting",
      isPublic: false,
    },
    {
      key: "zero_decimal_currencies",
      value: JSON.stringify(ZERO_DECIMAL_CURRENCIES),
      type: "json",
      category: "system",
      label: "Zero Decimal Currencies",
      description: "Currencies that do not use decimal fractions",
      isPublic: false,
    },
    // ── Feature flags ───────────────────────────
    {
      key: "allow_registration",
      value: "true",
      type: "boolean",
      category: "features",
      label: "Allow Registration",
      description: "Allow new users to register",
      isPublic: false,
    },
    {
      key: "maintenance_mode",
      value: "false",
      type: "boolean",
      category: "features",
      label: "Maintenance Mode",
      description: "Put the app in read-only maintenance mode",
      isPublic: false,
    },
    // ── Limits ──────────────────────────────────
    {
      key: "max_accounts_per_user",
      value: "10",
      type: "number",
      category: "limits",
      label: "Max Accounts Per User",
      description: "Maximum number of accounts a user can create",
      isPublic: false,
    },
    {
      key: "max_categories_per_user",
      value: "50",
      type: "number",
      category: "limits",
      label: "Max Categories Per User",
      description: "Maximum number of custom categories a user can create",
      isPublic: false,
    },
  ] as const;

  for (const setting of APP_SETTINGS) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: {}, // never overwrite on re-seed
      create: { ...setting },
    });
  }

  console.log(`  ✓ ${APP_SETTINGS.length} app settings seeded`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log("═══════════════════════════════════════");
  console.log("🎉 DATABASE SEEDING COMPLETED!");
  console.log("═══════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
