// prisma/seed.ts

import { prisma } from "@/lib";

import { createId } from "@paralleldrive/cuid2";

import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting database seeding...\n");

  // ============================================
  // 1. CREATE DEMO USER
  // ============================================
  console.log("👤 Creating demo user...");

  const hashedPassword = await bcrypt.hash("Password123", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@finance.com" },
    update: {},
    create: {
      email: "demo@finance.com",
      password: hashedPassword,
      name: "Demo User",
      avatar: null,
    },
  });

  console.log("✅ Demo user created: demo@finance.com / Password123\n");

  // ============================================
  // 2. CREATE DEFAULT CATEGORIES
  // ============================================
  console.log("📁 Creating default categories...");

  const defaultCategories = [
    // Income categories
    { name: "Salary", type: "INCOME", icon: "💰", color: "#10B981" },
    { name: "Bonus", type: "INCOME", icon: "🎁", color: "#3B82F6" },
    { name: "Investment", type: "INCOME", icon: "📈", color: "#8B5CF6" },
    { name: "Freelance", type: "INCOME", icon: "💼", color: "#F59E0B" },
    { name: "Business", type: "INCOME", icon: "🏪", color: "#06B6D4" },
    { name: "Gift", type: "INCOME", icon: "🎉", color: "#EC4899" },
    { name: "Other Income", type: "INCOME", icon: "💵", color: "#6B7280" },

    // Expense categories
    { name: "Food & Drinks", type: "EXPENSE", icon: "🍔", color: "#EF4444" },
    { name: "Transportation", type: "EXPENSE", icon: "🚗", color: "#F59E0B" },
    { name: "Shopping", type: "EXPENSE", icon: "🛒", color: "#8B5CF6" },
    { name: "Entertainment", type: "EXPENSE", icon: "🎬", color: "#EC4899" },
    { name: "Bills & Utilities", type: "EXPENSE", icon: "📄", color: "#6366F1" },
    { name: "Healthcare", type: "EXPENSE", icon: "⚕️", color: "#14B8A6" },
    { name: "Education", type: "EXPENSE", icon: "📚", color: "#06B6D4" },
    { name: "Household", type: "EXPENSE", icon: "🏠", color: "#84CC16" },
    { name: "Clothing", type: "EXPENSE", icon: "👕", color: "#A855F7" },
    { name: "Beauty", type: "EXPENSE", icon: "💄", color: "#F472B6" },
    { name: "Technology", type: "EXPENSE", icon: "💻", color: "#3B82F6" },
    { name: "Sports & Fitness", type: "EXPENSE", icon: "⚽", color: "#22C55E" },
    { name: "Donation", type: "EXPENSE", icon: "🤲", color: "#10B981" },
  ];

  const categoryIds: Record<string, string> = {};

  for (const category of defaultCategories) {
    const categoryId = createId();

    const created = await prisma.category.upsert({
      where: { id: categoryId },
      update: {},
      create: {
        id: categoryId,
        userId: demoUser.id,
        name: category.name,
        type: category.type as "INCOME" | "EXPENSE",
        icon: category.icon,
        color: category.color,
        isDefault: true,
      },
    });
    categoryIds[category.name] = created.id;
  }

  console.log(`✅ Created ${defaultCategories.length} default categories\n`);

  // ============================================
  // 3. CREATE ACCOUNTS
  // ============================================
  console.log("💳 Creating accounts...");

  const accounts = await Promise.all([
    prisma.account.create({
      data: {
        userId: demoUser.id,
        name: "Cash",
        type: "CASH",
        balance: 556000,
        color: "#10B981",
        icon: "💵",
        isDefault: true,
      },
    }),
    prisma.account.create({
      data: {
        userId: demoUser.id,
        name: "Bank Account",
        type: "BANK",
        balance: 30415000,
        color: "#3B82F6",
        icon: "🏦",
      },
    }),
    prisma.account.create({
      data: {
        userId: demoUser.id,
        name: "Digital Wallet",
        type: "EWALLET",
        balance: 1250000,
        color: "#22C55E",
        icon: "📱",
      },
    }),
    prisma.account.create({
      data: {
        userId: demoUser.id,
        name: "Credit Card",
        type: "CREDIT_CARD",
        balance: -12500800,
        color: "#EF4444",
        icon: "💳",
      },
    }),
  ]);

  console.log(`✅ Created ${accounts.length} accounts\n`);

  // ============================================
  // 4. CREATE TRANSACTIONS (Last 3 months)
  // ============================================
  console.log("💰 Creating transactions...");

  const now = new Date();

  // Helper function to get random date in last N days
  const getRandomDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    return date;
  };

  // Helper to get random item from array
  const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const incomeData = [
    // Monthly salary (last 3 months)
    { accountId: accounts[1].id, categoryId: categoryIds["Salary"], amount: 8500000, type: "INCOME" as const, description: "Monthly Salary - August", date: new Date(2025, 7, 25) },
    { accountId: accounts[1].id, categoryId: categoryIds["Salary"], amount: 8500000, type: "INCOME" as const, description: "Monthly Salary - September", date: new Date(2025, 8, 25) },
    { accountId: accounts[1].id, categoryId: categoryIds["Salary"], amount: 8500000, type: "INCOME" as const, description: "Monthly Salary - October", date: new Date(2025, 9, 25) },
    { accountId: accounts[1].id, categoryId: categoryIds["Salary"], amount: 8500000, type: "INCOME" as const, description: "Monthly Salary - August", date: new Date(2024, 7, 25) },
    { accountId: accounts[1].id, categoryId: categoryIds["Salary"], amount: 8500000, type: "INCOME" as const, description: "Monthly Salary - September", date: new Date(2024, 8, 25) },
    { accountId: accounts[1].id, categoryId: categoryIds["Salary"], amount: 8500000, type: "INCOME" as const, description: "Monthly Salary - October", date: new Date(2024, 9, 25) },

    // Bonus
    { accountId: accounts[1].id, categoryId: categoryIds["Bonus"], amount: 4000000, type: "INCOME" as const, description: "Q3 Performance Bonus", date: new Date(2025, 8, 30) },
    { accountId: accounts[1].id, categoryId: categoryIds["Bonus"], amount: 4000000, type: "INCOME" as const, description: "Q3 Performance Bonus", date: new Date(2024, 8, 30) },

    // Freelance
    { accountId: accounts[1].id, categoryId: categoryIds["Freelance"], amount: 2800000, type: "INCOME" as const, description: "Website Project - Client A", date: new Date(2025, 7, 15) },
    { accountId: accounts[1].id, categoryId: categoryIds["Freelance"], amount: 1800000, type: "INCOME" as const, description: "IT Consulting", date: new Date(2025, 8, 10) },

    // Investment
    { accountId: accounts[1].id, categoryId: categoryIds["Investment"], amount: 650000, type: "INCOME" as const, description: "Stock Dividends", date: new Date(2025, 8, 5) },
    { accountId: accounts[1].id, categoryId: categoryIds["Investment"], amount: 650000, type: "INCOME" as const, description: "Stock Dividends", date: new Date(2024, 8, 5) },
  ];

  // Expense transactions (realistic daily expenses)
  const expenseData = [
    // Food & Drinks (frequent)
    ...Array.from({ length: 60 }, () => ({
      accountId: getRandom([accounts[0].id, accounts[2].id]), // Cash or Digital Wallet
      categoryId: categoryIds["Food & Drinks"],
      amount: Math.floor(Math.random() * 75000) + 15000, // Rp15.000 - Rp90.000
      type: "EXPENSE" as const,
      description: getRandom(["Lunch", "Morning coffee", "Dinner", "Snacks", "Groceries", "Fast food", "Restaurant", "Cafe"]),
      date: getRandomDate(90),
    })),

    // Transportation
    ...Array.from({ length: 40 }, () => ({
      accountId: getRandom([accounts[0].id, accounts[2].id]),
      categoryId: categoryIds["Transportation"],
      amount: Math.floor(Math.random() * 40000) + 10000, // Rp10.000 - Rp50.000
      type: "EXPENSE" as const,
      description: getRandom(["Uber to office", "Gas", "Parking", "Taxi", "Toll road", "Public transport"]),
      date: getRandomDate(90),
    })),

    // Bills & Utilities (monthly)
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Bills & Utilities"],
      amount: 350000,
      type: "EXPENSE" as const,
      description: "Electricity Bill",
      date: new Date(2024, 7, 5),
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Bills & Utilities"],
      amount: 45000,
      type: "EXPENSE" as const,
      description: "Internet Bill",
      date: new Date(2024, 7, 10),
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Bills & Utilities"],
      amount: 65000,
      type: "EXPENSE" as const,
      description: "Netflix Subscription",
      date: new Date(2024, 7, 15),
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Bills & Utilities"],
      amount: 400000,
      type: "EXPENSE" as const,
      description: "Electricity Bill",
      date: new Date(2024, 8, 5),
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Bills & Utilities"],
      amount: 50000,
      type: "EXPENSE" as const,
      description: "Internet Bill",
      date: new Date(2024, 8, 10),
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Bills & Utilities"],
      amount: 65000,
      type: "EXPENSE" as const,
      description: "Netflix Subscription",
      date: new Date(2024, 8, 15),
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Bills & Utilities"],
      amount: 358000,
      type: "EXPENSE" as const,
      description: "Electricity Bill",
      date: new Date(2024, 9, 5),
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Bills & Utilities"],
      amount: 55000,
      type: "EXPENSE" as const,
      description: "Internet Bill",
      date: new Date(2024, 9, 10),
    },

    // Shopping
    {
      accountId: accounts[3].id,
      categoryId: categoryIds["Shopping"],
      amount: 350000,
      type: "EXPENSE" as const,
      description: "Monthly groceries",
      date: new Date(2024, 7, 8),
    },
    {
      accountId: accounts[3].id,
      categoryId: categoryIds["Shopping"],
      amount: 180000,
      type: "EXPENSE" as const,
      description: "Household items",
      date: new Date(2024, 7, 20),
    },
    {
      accountId: accounts[3].id,
      categoryId: categoryIds["Shopping"],
      amount: 35600,
      type: "EXPENSE" as const,
      description: "Monthly groceries",
      date: new Date(2024, 8, 8),
    },
    {
      accountId: accounts[3].id,
      categoryId: categoryIds["Shopping"],
      amount: 140000,
      type: "EXPENSE" as const,
      description: "Kitchen supplies",
      date: new Date(2024, 8, 22),
    },

    // Entertainment
    {
      accountId: accounts[0].id,
      categoryId: categoryIds["Entertainment"],
      amount: 55000,
      type: "EXPENSE" as const,
      description: "Movie theater",
      date: new Date(2024, 7, 12),
    },
    {
      accountId: accounts[2].id,
      categoryId: categoryIds["Entertainment"],
      amount: 60000,
      type: "EXPENSE" as const,
      description: "Karaoke with friends",
      date: new Date(2024, 8, 16),
    },
    {
      accountId: accounts[0].id,
      categoryId: categoryIds["Entertainment"],
      amount: 850000,
      type: "EXPENSE" as const,
      description: "Concert tickets",
      date: new Date(2024, 9, 3),
    },

    // Healthcare
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Healthcare"],
      amount: 150000,
      type: "EXPENSE" as const,
      description: "Regular checkup",
      date: new Date(2024, 7, 18),
    },
    {
      accountId: accounts[0].id,
      categoryId: categoryIds["Healthcare"],
      amount: 253022,
      type: "EXPENSE" as const,
      description: "Cold medicine",
      date: new Date(2024, 8, 25),
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Healthcare"],
      amount: 952380,
      type: "EXPENSE" as const,
      description: "Dentist visit",
      date: new Date(2024, 9, 8),
    },

    // Technology
    {
      accountId: accounts[3].id,
      categoryId: categoryIds["Technology"],
      amount: 899890,
      type: "EXPENSE" as const,
      description: "New smartphone",
      date: new Date(2024, 7, 22),
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Technology"],
      amount: 451231,
      type: "EXPENSE" as const,
      description: "Wireless mouse",
      date: new Date(2024, 8, 14),
    },

    // Clothing
    {
      accountId: accounts[3].id,
      categoryId: categoryIds["Clothing"],
      amount: 180909,
      type: "EXPENSE" as const,
      description: "Work clothes",
      date: new Date(2024, 7, 28),
    },
    {
      accountId: accounts[0].id,
      categoryId: categoryIds["Clothing"],
      amount: 95000,
      type: "EXPENSE" as const,
      description: "Sneakers",
      date: new Date(2024, 9, 1),
    },

    // Sports & Fitness
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Sports & Fitness"],
      amount: 650000,
      type: "EXPENSE" as const,
      description: "Gym membership (1 month)",
      date: new Date(2024, 8, 1),
    },

    // Donation
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Donation"],
      amount: 50000,
      type: "EXPENSE" as const,
      description: "Charity donation",
      date: new Date(2024, 8, 15),
    },
  ];

  // Create all transactions
  for (const tx of [...incomeData, ...expenseData]) {
    await prisma.transaction.create({
      data: {
        userId: demoUser.id,
        ...tx,
      },
    });
  }

  console.log(`✅ Created ${incomeData.length + expenseData.length} transactions\n`);

  // ============================================
  // 5. CREATE BUDGETS (Current Month)
  // ============================================
  console.log("📊 Creating budgets...");

  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const budgets = [
    { categoryId: categoryIds["Food & Drinks"], amount: 12400000 },
    { categoryId: categoryIds["Transportation"], amount: 4650000 },
    { categoryId: categoryIds["Shopping"], amount: 7750000 },
    { categoryId: categoryIds["Entertainment"], amount: 2325000 },
    { categoryId: categoryIds["Bills & Utilities"], amount: 3875000 },
    { categoryId: categoryIds["Healthcare"], amount: 3100000 },
    { categoryId: categoryIds["Technology"], amount: 4650000 },
  ];

  for (const budget of budgets) {
    // Calculate spent for current month
    const spent = await prisma.transaction.aggregate({
      where: {
        userId: demoUser.id,
        categoryId: budget.categoryId,
        type: "EXPENSE",
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lte: new Date(currentYear, currentMonth, 0),
        },
      },
      _sum: { amount: true },
    });

    await prisma.budget.create({
      data: {
        userId: demoUser.id,
        categoryId: budget.categoryId,
        amount: budget.amount,
        spent: spent._sum.amount || 0,
        month: currentMonth,
        year: currentYear,
      },
    });
  }

  console.log(`✅ Created ${budgets.length} budgets\n`);

  // ============================================
  // 6. CREATE FINANCIAL GOALS
  // ============================================
  console.log("🎯 Creating financial goals...");

  const goals = [
    {
      name: "Emergency Fund",
      targetAmount: 155_000_000,
      currentAmount: 77_500_000,
      deadline: new Date(2025, 5, 30),
      status: "ACTIVE" as const,
    },
    {
      name: "Buy Motorcycle",
      targetAmount: 124_000_000,
      currentAmount: 43_400_000,
      deadline: new Date(2025, 11, 31),
      status: "ACTIVE" as const,
    },
    {
      name: "Japan Vacation",
      targetAmount: 100_750_000,
      currentAmount: 27_900_000,
      deadline: new Date(2025, 8, 30),
      status: "ACTIVE" as const,
    },
    {
      name: "Room Renovation",
      targetAmount: 77_500_000,
      currentAmount: 62_000_000,
      deadline: new Date(2025, 2, 31),
      status: "ACTIVE" as const,
    },
    {
      name: "New Laptop",
      targetAmount: 54_250_000,
      currentAmount: 54_250_000,
      deadline: new Date(2024, 7, 30),
      status: "COMPLETED" as const,
    },
  ];

  for (const goal of goals) {
    await prisma.goal.create({
      data: {
        userId: demoUser.id,
        ...goal,
      },
    });
  }

  console.log(`✅ Created ${goals.length} financial goals\n`);

  // ============================================
  // 7. CREATE RECURRING TRANSACTIONS
  // ============================================
  console.log("🔄 Creating recurring transactions...");

  const recurring = [
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Salary"],
      amount: 85_250_000, // 5,500 USD → Rp85.250.000
      type: "INCOME" as const,
      description: "Monthly Salary",
      frequency: "MONTHLY" as const,
      startDate: new Date(2024, 0, 25),
      nextOccurrence: new Date(2024, 10, 25),
      isActive: true,
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Bills & Utilities"],
      amount: 1_860_000, // 120 USD → Rp1.860.000
      type: "EXPENSE" as const,
      description: "Electricity Bill",
      frequency: "MONTHLY" as const,
      startDate: new Date(2024, 0, 5),
      nextOccurrence: new Date(2024, 10, 5),
      isActive: true,
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Bills & Utilities"],
      amount: 1_240_000, // 80 USD → Rp1.240.000
      type: "EXPENSE" as const,
      description: "Internet Bill",
      frequency: "MONTHLY" as const,
      startDate: new Date(2024, 0, 10),
      nextOccurrence: new Date(2024, 10, 10),
      isActive: true,
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Bills & Utilities"],
      amount: 232_500, // 15 USD → Rp232.500
      type: "EXPENSE" as const,
      description: "Netflix Premium",
      frequency: "MONTHLY" as const,
      startDate: new Date(2024, 0, 15),
      nextOccurrence: new Date(2024, 10, 15),
      isActive: true,
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Sports & Fitness"],
      amount: 1_007_500, // 65 USD → Rp1.007.500
      type: "EXPENSE" as const,
      description: "Gym Membership",
      frequency: "MONTHLY" as const,
      startDate: new Date(2024, 8, 1),
      nextOccurrence: new Date(2024, 10, 1),
      isActive: true,
    },
  ];

  for (const rec of recurring) {
    await prisma.recurringTransaction.create({
      data: {
        userId: demoUser.id,
        ...rec,
      },
    });
  }

  console.log(`✅ Created ${recurring.length} recurring transactions\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log("═══════════════════════════════════════");
  console.log("🎉 DATABASE SEEDING COMPLETED!");
  console.log("═══════════════════════════════════════\n");

  console.log("📦 Summary:");
  console.log(`   • ${defaultCategories.length} default categories`);
  console.log(`   • 1 demo user`);
  console.log(`   • ${accounts.length} accounts`);
  console.log(`   • ${incomeData.length + expenseData.length} transactions`);
  console.log(`   • ${budgets.length} budgets`);
  console.log(`   • ${goals.length} financial goals`);
  console.log(`   • ${recurring.length} recurring transactions\n`);

  console.log("🔐 Login Credentials:");
  console.log("   Email: demo@finance.com");
  console.log("   Password: password123\n");

  console.log("💡 Next Steps:");
  console.log("   1. npm run dev");
  console.log("   2. Login with the credentials above");
  console.log("   3. Explore dashboard and features\n");

  // Calculate and show summary stats
  const totalIncome = incomeData.reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = expenseData.reduce((sum, tx) => sum + tx.amount, 0);
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  console.log("📊 Financial Summary:");
  console.log(`   • Total Income (3 months): $${totalIncome.toLocaleString("en-US")}`);
  console.log(`   • Total Expense (3 months): $${totalExpense.toLocaleString("en-US")}`);
  console.log(`   • Net Savings: $${(totalIncome - totalExpense).toLocaleString("en-US")}`);
  console.log(`   • Current Total Balance: $${totalBalance.toLocaleString("en-US")}\n`);

  console.log("🌐 Open Prisma Studio:");
  console.log("   npx prisma studio\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
