import { prisma } from "@/lib";
import { createId } from "@paralleldrive/cuid2";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting database seeding...\n");

  // ============================================
  // 1. CREATE DEMO USER
  // ============================================
  console.log("👤 Creating demo user...");

  const hashedPassword = await bcrypt.hash("password123", 10);

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

  console.log("✅ Demo user created: demo@finance.com / password123\n");

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
        balance: 2500000,
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
        balance: 45750000,
        color: "#3B82F6",
        icon: "🏦",
      },
    }),
    prisma.account.create({
      data: {
        userId: demoUser.id,
        name: "Digital Wallet",
        type: "EWALLET",
        balance: 1850000,
        color: "#22C55E",
        icon: "📱",
      },
    }),
    prisma.account.create({
      data: {
        userId: demoUser.id,
        name: "Credit Card",
        type: "CREDIT_CARD",
        balance: -8500000,
        color: "#EF4444",
        icon: "💳",
      },
    }),
  ]);

  console.log(`✅ Created ${accounts.length} accounts\n`);

  // ============================================
  // 4. CREATE TRANSACTIONS (Recent 6 months)
  // ============================================
  console.log("💰 Creating transactions...");

  // Helper to get random date in specific month
  const getRandomDateInMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    return new Date(year, month, day, hour, minute);
  };

  // Helper to get random item from array
  const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Generate transactions for last 6 months
  const incomeData = [];
  const expenseData = [];

  // Generate monthly salaries for last 6 months
  for (let i = 5; i >= 0; i--) {
    const month = currentMonth - i;
    const year = month < 0 ? currentYear - 1 : currentYear;
    const adjustedMonth = month < 0 ? month + 12 : month;

    incomeData.push({
      accountId: accounts[1].id,
      categoryId: categoryIds["Salary"],
      amount: 12500000,
      type: "INCOME" as const,
      description: "Monthly Salary",
      date: new Date(year, adjustedMonth, 25),
    });

    // Occasional bonuses
    if (i === 2 || i === 5) {
      incomeData.push({
        accountId: accounts[1].id,
        categoryId: categoryIds["Bonus"],
        amount: 5000000,
        type: "INCOME" as const,
        description: "Performance Bonus",
        date: getRandomDateInMonth(year, adjustedMonth),
      });
    }

    // Freelance income (random months)
    if (Math.random() > 0.5) {
      incomeData.push({
        accountId: accounts[1].id,
        categoryId: categoryIds["Freelance"],
        amount: Math.floor(Math.random() * 3000000) + 1500000,
        type: "INCOME" as const,
        description: getRandom(["Website Project", "Consulting Work", "Design Project", "App Development"]),
        date: getRandomDateInMonth(year, adjustedMonth),
      });
    }

    // Investment returns
    if (i % 3 === 0) {
      incomeData.push({
        accountId: accounts[1].id,
        categoryId: categoryIds["Investment"],
        amount: Math.floor(Math.random() * 800000) + 400000,
        type: "INCOME" as const,
        description: "Investment Returns",
        date: getRandomDateInMonth(year, adjustedMonth),
      });
    }
  }

  // Generate expenses for last 6 months
  for (let i = 5; i >= 0; i--) {
    const month = currentMonth - i;
    const year = month < 0 ? currentYear - 1 : currentYear;
    const adjustedMonth = month < 0 ? month + 12 : month;

    // Food & Drinks (3-5 times per week)
    for (let j = 0; j < 20; j++) {
      expenseData.push({
        accountId: getRandom([accounts[0].id, accounts[2].id]),
        categoryId: categoryIds["Food & Drinks"],
        amount: Math.floor(Math.random() * 100000) + 20000,
        type: "EXPENSE" as const,
        description: getRandom(["Breakfast", "Lunch", "Dinner", "Coffee", "Snacks", "Restaurant", "Fast Food", "Groceries"]),
        date: getRandomDateInMonth(year, adjustedMonth),
      });
    }

    // Transportation (daily)
    for (let j = 0; j < 15; j++) {
      expenseData.push({
        accountId: getRandom([accounts[0].id, accounts[2].id]),
        categoryId: categoryIds["Transportation"],
        amount: Math.floor(Math.random() * 60000) + 15000,
        type: "EXPENSE" as const,
        description: getRandom(["Taxi", "Uber", "Gas", "Parking", "Toll", "Public Transport"]),
        date: getRandomDateInMonth(year, adjustedMonth),
      });
    }

    // Bills & Utilities (monthly)
    expenseData.push(
      {
        accountId: accounts[1].id,
        categoryId: categoryIds["Bills & Utilities"],
        amount: Math.floor(Math.random() * 100000) + 350000,
        type: "EXPENSE" as const,
        description: "Electricity Bill",
        date: new Date(year, adjustedMonth, 5),
      },
      {
        accountId: accounts[1].id,
        categoryId: categoryIds["Bills & Utilities"],
        amount: 450000,
        type: "EXPENSE" as const,
        description: "Internet Bill",
        date: new Date(year, adjustedMonth, 10),
      },
      {
        accountId: accounts[1].id,
        categoryId: categoryIds["Bills & Utilities"],
        amount: 165000,
        type: "EXPENSE" as const,
        description: "Streaming Subscriptions",
        date: new Date(year, adjustedMonth, 15),
      }
    );

    // Shopping (2-4 times per month)
    for (let j = 0; j < 3; j++) {
      expenseData.push({
        accountId: getRandom([accounts[2].id, accounts[3].id]),
        categoryId: categoryIds["Shopping"],
        amount: Math.floor(Math.random() * 500000) + 100000,
        type: "EXPENSE" as const,
        description: getRandom(["Groceries", "Household Items", "Personal Care", "Electronics", "Books"]),
        date: getRandomDateInMonth(year, adjustedMonth),
      });
    }

    // Entertainment (1-2 times per month)
    if (Math.random() > 0.3) {
      expenseData.push({
        accountId: getRandom([accounts[0].id, accounts[2].id]),
        categoryId: categoryIds["Entertainment"],
        amount: Math.floor(Math.random() * 300000) + 50000,
        type: "EXPENSE" as const,
        description: getRandom(["Cinema", "Concert", "Games", "Karaoke", "Bowling"]),
        date: getRandomDateInMonth(year, adjustedMonth),
      });
    }

    // Healthcare (occasional)
    if (Math.random() > 0.6) {
      expenseData.push({
        accountId: getRandom([accounts[0].id, accounts[1].id]),
        categoryId: categoryIds["Healthcare"],
        amount: Math.floor(Math.random() * 500000) + 100000,
        type: "EXPENSE" as const,
        description: getRandom(["Doctor Visit", "Medicine", "Dental", "Eye Care", "Health Supplements"]),
        date: getRandomDateInMonth(year, adjustedMonth),
      });
    }

    // Clothing (occasional)
    if (Math.random() > 0.7) {
      expenseData.push({
        accountId: getRandom([accounts[2].id, accounts[3].id]),
        categoryId: categoryIds["Clothing"],
        amount: Math.floor(Math.random() * 400000) + 150000,
        type: "EXPENSE" as const,
        description: getRandom(["Shirts", "Pants", "Shoes", "Accessories", "Jacket"]),
        date: getRandomDateInMonth(year, adjustedMonth),
      });
    }

    // Sports & Fitness (monthly)
    if (i <= 3) {
      expenseData.push({
        accountId: accounts[1].id,
        categoryId: categoryIds["Sports & Fitness"],
        amount: 750000,
        type: "EXPENSE" as const,
        description: "Gym Membership",
        date: new Date(year, adjustedMonth, 1),
      });
    }
  }

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

  const budgets = [
    { categoryId: categoryIds["Food & Drinks"], amount: 3000000 },
    { categoryId: categoryIds["Transportation"], amount: 1500000 },
    { categoryId: categoryIds["Shopping"], amount: 2000000 },
    { categoryId: categoryIds["Entertainment"], amount: 800000 },
    { categoryId: categoryIds["Bills & Utilities"], amount: 1500000 },
    { categoryId: categoryIds["Healthcare"], amount: 1000000 },
    { categoryId: categoryIds["Clothing"], amount: 1000000 },
  ];

  for (const budget of budgets) {
    const spent = await prisma.transaction.aggregate({
      where: {
        userId: demoUser.id,
        categoryId: budget.categoryId,
        type: "EXPENSE",
        date: {
          gte: new Date(currentYear, currentMonth, 1),
          lte: new Date(currentYear, currentMonth + 1, 0),
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
        month: currentMonth + 1,
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
      targetAmount: 50000000,
      currentAmount: 35000000,
      deadline: new Date(currentYear, currentMonth + 6, 30),
      status: "ACTIVE" as const,
    },
    {
      name: "New Laptop",
      targetAmount: 25000000,
      currentAmount: 18500000,
      deadline: new Date(currentYear, currentMonth + 3, 30),
      status: "ACTIVE" as const,
    },
    {
      name: "Vacation Fund",
      targetAmount: 15000000,
      currentAmount: 8200000,
      deadline: new Date(currentYear, currentMonth + 8, 30),
      status: "ACTIVE" as const,
    },
    {
      name: "Investment Portfolio",
      targetAmount: 100000000,
      currentAmount: 42000000,
      deadline: new Date(currentYear + 1, 11, 31),
      status: "ACTIVE" as const,
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
      amount: 12500000,
      type: "INCOME" as const,
      description: "Monthly Salary",
      frequency: "MONTHLY" as const,
      startDate: new Date(currentYear, 0, 25),
      nextOccurrence: new Date(currentYear, currentMonth + 1, 25),
      isActive: true,
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Bills & Utilities"],
      amount: 400000,
      type: "EXPENSE" as const,
      description: "Electricity Bill",
      frequency: "MONTHLY" as const,
      startDate: new Date(currentYear, 0, 5),
      nextOccurrence: new Date(currentYear, currentMonth + 1, 5),
      isActive: true,
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Bills & Utilities"],
      amount: 450000,
      type: "EXPENSE" as const,
      description: "Internet Bill",
      frequency: "MONTHLY" as const,
      startDate: new Date(currentYear, 0, 10),
      nextOccurrence: new Date(currentYear, currentMonth + 1, 10),
      isActive: true,
    },
    {
      accountId: accounts[1].id,
      categoryId: categoryIds["Sports & Fitness"],
      amount: 750000,
      type: "EXPENSE" as const,
      description: "Gym Membership",
      frequency: "MONTHLY" as const,
      startDate: new Date(currentYear, currentMonth - 3, 1),
      nextOccurrence: new Date(currentYear, currentMonth + 1, 1),
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

  const totalIncome = incomeData.reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = expenseData.reduce((sum, tx) => sum + tx.amount, 0);
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  console.log("📦 Summary:");
  console.log(`   • ${defaultCategories.length} categories`);
  console.log(`   • 1 demo user`);
  console.log(`   • ${accounts.length} accounts`);
  console.log(`   • ${incomeData.length + expenseData.length} transactions`);
  console.log(`   • ${budgets.length} budgets`);
  console.log(`   • ${goals.length} goals`);
  console.log(`   • ${recurring.length} recurring transactions\n`);

  console.log("🔐 Credentials:");
  console.log("   Email: demo@finance.com");
  console.log("   Password: password123\n");

  console.log("📊 Financial Summary (6 months):");
  console.log(`   • Total Income: Rp ${totalIncome.toLocaleString("id-ID")}`);
  console.log(`   • Total Expense: Rp ${totalExpense.toLocaleString("id-ID")}`);
  console.log(`   • Net Savings: Rp ${(totalIncome - totalExpense).toLocaleString("id-ID")}`);
  console.log(`   • Current Balance: Rp ${totalBalance.toLocaleString("id-ID")}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
