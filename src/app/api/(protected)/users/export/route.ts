import { NextResponse } from "next/server";

import PDFDocument from "pdfkit";

import fs from "fs";

import path from "path";

import { prisma, requireAuth } from "@/lib";

import { errorResponse, formattedCurrency } from "@/utils";

const COLORS = {
  primary: "#1e293b",
  secondary: "#475569",
  accent: "#3b82f6",
  success: "#10b981",
  danger: "#ef4444",
  light: "#f1f5f9",
  white: "#ffffff",
  border: "#e2e8f0",
};

const FONTS = {
  regular: path.join(process.cwd(), "public", "fonts", "SpaceGrotesk-Regular.ttf"),
};

interface Transaction {
  id: string;
  date: Date;
  type: string;
  amount: number;
  category?: { name: string } | null;
  account?: { name: string } | null;
}

interface UserData {
  name: string | null;
  email: string | null;
  transactions: Transaction[];
}

interface Metrics {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
  avgDailyExpense: number;
  firstDate: Date;
  lastDate: Date;
}

const calculateMetrics = (transactions: Transaction[]) => {
  const income = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expense;
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  const firstDate = transactions.length ? new Date(transactions[transactions.length - 1].date) : new Date();
  const lastDate = transactions.length ? new Date(transactions[0].date) : new Date();
  const daysInRange = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
  const avgDailyExpense = expense / daysInRange;

  return { income, expense, balance, savingsRate, avgDailyExpense, firstDate, lastDate };
};

const getTopCategories = (transactions: Transaction[], limit = 5) => {
  const categoryTotals: Record<string, number> = {};

  transactions
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      const name = t.category?.name || "Uncategorized";
      categoryTotals[name] = (categoryTotals[name] || 0) + Number(t.amount);
    });

  return Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
};

const drawCard = (doc: PDFKit.PDFDocument, title: string, height: number, color: string) => {
  const y = doc.y;
  const margin = 50;
  const width = doc.page.width - margin * 2;

  doc
    .fillColor("#000000")
    .opacity(0.05)
    .rect(margin + 2, y + 2, width, height)
    .fill();
  doc.fillColor(COLORS.white).opacity(1).rect(margin, y, width, height).fill();

  doc.fillColor(color).rect(margin, y, 4, height).fill();

  doc
    .fillColor(COLORS.light)
    .rect(margin + 4, y, width - 4, 35)
    .fill();

  doc
    .fillColor(COLORS.primary)
    .fontSize(14)
    .font(FONTS.regular)
    .text(title, margin + 20, y + 12, { width: width - 40 });

  doc.y = y + 45;
  return y;
};

const generatePDF = async (userData: UserData, metrics: Metrics, topCategories: [string, number][]) => {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      if (!fs.existsSync(FONTS.regular)) {
        throw new Error("Font file not found at " + FONTS.regular);
      }

      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
        bufferPages: true,
        font: FONTS.regular,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fillColor(COLORS.primary).fontSize(28).font(FONTS.regular).text("Financial Report", { align: "center" });

      doc.moveDown(0.3);
      doc
        .fontSize(11)
        .fillColor(COLORS.secondary)
        .text(
          `Generated on ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          { align: "center" }
        );

      doc.moveDown(1.5);

      doc
        .fontSize(10)
        .fillColor(COLORS.secondary)
        .text(`User: ${userData.name || "Unknown"}`, 50);
      doc.text(`Email: ${userData.email || "N/A"}`, 50);
      doc.text(`Period: ${metrics.firstDate.toLocaleDateString()} - ${metrics.lastDate.toLocaleDateString()}`, 50);

      doc.moveDown(1.5);

      drawCard(doc, "Financial Summary", 150, COLORS.accent);

      const summaryY = doc.y;
      doc.fontSize(11).fillColor(COLORS.secondary);

      const col1X = 70;
      const col2X = 320;

      doc.text("Total Income", col1X, summaryY);
      doc.fillColor(COLORS.success).text(formattedCurrency(metrics.income), col2X, summaryY, {
        align: "right",
        width: 200,
      });

      doc.fillColor(COLORS.secondary).text("Total Expenses", col1X, summaryY + 25);
      doc.fillColor(COLORS.danger).text(formattedCurrency(metrics.expense), col2X, summaryY + 25, {
        align: "right",
        width: 200,
      });

      doc.fillColor(COLORS.secondary).text("Net Balance", col1X, summaryY + 50);
      doc.fillColor(metrics.balance >= 0 ? COLORS.success : COLORS.danger).text(formattedCurrency(metrics.balance), col2X, summaryY + 50, {
        align: "right",
        width: 200,
      });

      doc.fillColor(COLORS.secondary).text("Savings Rate", col1X, summaryY + 75);
      doc.fillColor(COLORS.primary).text(`${metrics.savingsRate.toFixed(1)}%`, col2X, summaryY + 75, {
        align: "right",
        width: 200,
      });

      doc.y = summaryY + 110;
      doc.moveDown(2);

      if (topCategories.length > 0) {
        drawCard(doc, "Top Spending Categories", 50 + topCategories.length * 25, COLORS.success);

        topCategories.forEach(([name, total], idx) => {
          const itemY = doc.y;
          doc
            .fontSize(10)
            .fillColor(COLORS.secondary)
            .text(`${idx + 1}. ${name}`, 70, itemY, { width: 300 });
          doc.fillColor(COLORS.primary).text(formattedCurrency(total), 70, itemY, { align: "right", width: 450 });
          doc.y = itemY + 25;
        });

        doc.moveDown(2);
      }

      doc.addPage();
      doc.fontSize(16).fillColor(COLORS.primary).text("Transaction History", 50, 50);

      doc.moveDown(1);

      if (userData.transactions.length === 0) {
        doc.fontSize(11).fillColor(COLORS.secondary).text("No transactions found", { align: "center" });
      } else {
        const tableTop = doc.y;
        const dateX = 50;
        const typeX = 130;
        const categoryX = 200;
        const accountX = 320;
        const amountX = 450;

        doc.rect(50, tableTop, doc.page.width - 100, 20).fill(COLORS.primary);

        doc.fontSize(9).fillColor(COLORS.white);
        doc.text("Date", dateX + 5, tableTop + 6);
        doc.text("Type", typeX + 5, tableTop + 6);
        doc.text("Category", categoryX + 5, tableTop + 6);
        doc.text("Account", accountX + 5, tableTop + 6);
        doc.text("Amount", amountX + 5, tableTop + 6);

        doc.y = tableTop + 25;

        userData.transactions.forEach((t, idx) => {
          const rowY = doc.y;

          if (idx % 2 === 0) {
            doc
              .fillColor(COLORS.light)
              .rect(50, rowY, doc.page.width - 100, 18)
              .fill();
          }

          const date = new Date(t.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          doc.fontSize(9).fillColor(COLORS.secondary);
          doc.text(date, dateX + 5, rowY + 4, { width: 70 });
          doc.text(t.type || "-", typeX + 5, rowY + 4, { width: 60 });
          doc.text(t.category?.name || "Uncategorized", categoryX + 5, rowY + 4, { width: 110 });
          doc.text(t.account?.name || "-", accountX + 5, rowY + 4, { width: 120 });

          doc.fillColor(t.type === "INCOME" ? COLORS.success : COLORS.danger);
          doc.text(formattedCurrency(Number(t.amount)), amountX + 5, rowY + 4);

          doc.y = rowY + 18;

          if (doc.y > doc.page.height - 100) {
            doc.addPage();
            doc.y = 50;
          }
        });
      }

      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .fillColor(COLORS.secondary)
          .text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, { align: "center", width: doc.page.width - 100 });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export async function GET() {
  try {
    const user = await requireAuth();

    if (!user) return errorResponse("Unauthorized", 401);

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        transactions: {
          orderBy: { date: "desc" },
          include: { category: true, account: true },
        },
      },
    });

    if (!userData) return errorResponse("User not found", 404);

    const transactions: Transaction[] = (userData.transactions || []).map((t) => ({
      id: t.id,
      date: t.date,
      type: t.type,
      amount: Number(t.amount),
      category: t.category ? { name: t.category.name } : null,
      account: t.account ? { name: t.account.name } : null,
    }));

    const metrics = calculateMetrics(transactions);
    const topCategories = getTopCategories(transactions);

    const pdfBuffer = await generatePDF(
      {
        name: userData.name,
        email: userData.email,
        transactions,
      },
      metrics,
      topCategories
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="finarthax-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}
