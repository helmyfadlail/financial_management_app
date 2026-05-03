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
} as const;

const FONT_NAME = "SpaceGrotesk";
const MARGIN = 50;
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const CONTENT_W = PAGE_WIDTH - MARGIN * 2;

const resolveFontPath = (): string => {
  const filename = "SpaceGrotesk-Regular.ttf";

  try {
    const fileUrl = new URL(import.meta.url);
    let dir = path.dirname(fileUrl.pathname);

    for (let i = 0; i < 10; i++) {
      const candidate = path.join(dir, "public", "fonts", filename);
      if (fs.existsSync(candidate)) return candidate;
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  } catch {}

  const cwdCandidate = path.join(process.cwd(), "public", "fonts", filename);
  if (fs.existsSync(cwdCandidate)) return cwdCandidate;

  throw new Error(`Font "${filename}" could not be located. ` + `Make sure public/fonts/${filename} is committed and included in your deployment.`);
};

const FONT_BUFFER: Buffer = (() => {
  const fontPath = resolveFontPath();
  return fs.readFileSync(fontPath);
})();

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

const calculateMetrics = (transactions: Transaction[]): Metrics => {
  const income = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0);

  const balance = income - expense;
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstDate = sorted.length ? new Date(sorted[0].date) : new Date();
  const lastDate = sorted.length ? new Date(sorted[sorted.length - 1].date) : new Date();

  const daysInRange = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / 86_400_000));
  const avgDailyExpense = expense / daysInRange;

  return { income, expense, balance, savingsRate, avgDailyExpense, firstDate, lastDate };
};

const getTopCategories = (transactions: Transaction[], limit = 5): [string, number][] => {
  const totals: Record<string, number> = {};

  transactions
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      const key = t.category?.name ?? "Uncategorized";
      totals[key] = (totals[key] ?? 0) + Number(t.amount);
    });

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
};

const drawCard = (doc: PDFKit.PDFDocument, title: string, height: number, accentColor: string): number => {
  const y = doc.y;

  doc.save();
  doc
    .fillColor("#000000")
    .opacity(0.05)
    .rect(MARGIN + 2, y + 2, CONTENT_W, height)
    .fill();
  doc.fillColor(COLORS.white).opacity(1).rect(MARGIN, y, CONTENT_W, height).fill();
  doc.fillColor(accentColor).rect(MARGIN, y, 4, height).fill();
  doc
    .fillColor(COLORS.light)
    .rect(MARGIN + 4, y, CONTENT_W - 4, 35)
    .fill();
  doc.restore();

  doc
    .fillColor(COLORS.primary)
    .fontSize(14)
    .font(FONT_NAME)
    .text(title, MARGIN + 20, y + 12, { width: CONTENT_W - 40 });

  doc.y = y + 45;
  return y;
};

interface TableColumn {
  label: string;
  x: number;
  width: number;
}

const TABLE_COLUMNS: TableColumn[] = [
  { label: "Date", x: 55, width: 70 },
  { label: "Type", x: 135, width: 60 },
  { label: "Category", x: 205, width: 110 },
  { label: "Account", x: 325, width: 120 },
  { label: "Amount", x: 455, width: 90 },
];

const drawTableHeader = (doc: PDFKit.PDFDocument): void => {
  const y = doc.y;
  doc.save();
  doc.fillColor(COLORS.primary).rect(MARGIN, y, CONTENT_W, 20).fill();
  doc.fontSize(9).fillColor(COLORS.white);
  TABLE_COLUMNS.forEach((col) => doc.text(col.label, col.x, y + 6, { width: col.width }));
  doc.restore();
  doc.y = y + 25;
};

const drawTableRow = (doc: PDFKit.PDFDocument, t: Transaction, idx: number): void => {
  const rowY = doc.y;

  if (idx % 2 === 0) {
    doc.save();
    doc.fillColor(COLORS.light).rect(MARGIN, rowY, CONTENT_W, 18).fill();
    doc.restore();
  }

  const date = new Date(t.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  doc.fontSize(9).font(FONT_NAME).fillColor(COLORS.secondary);
  doc.text(date, TABLE_COLUMNS[0].x, rowY + 4, { width: TABLE_COLUMNS[0].width });
  doc.text(t.type ?? "-", TABLE_COLUMNS[1].x, rowY + 4, { width: TABLE_COLUMNS[1].width });
  doc.text(t.category?.name ?? "Uncategorized", TABLE_COLUMNS[2].x, rowY + 4, { width: TABLE_COLUMNS[2].width });
  doc.text(t.account?.name ?? "-", TABLE_COLUMNS[3].x, rowY + 4, { width: TABLE_COLUMNS[3].width });

  doc.fillColor(t.type === "INCOME" ? COLORS.success : COLORS.danger);
  doc.text(formattedCurrency(Number(t.amount)), TABLE_COLUMNS[4].x, rowY + 4, { width: TABLE_COLUMNS[4].width });

  doc.y = rowY + 18;
};

const generatePDF = (userData: UserData, metrics: Metrics, topCategories: [string, number][]): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: MARGIN, size: "A4", bufferPages: true });

      doc.registerFont(FONT_NAME, FONT_BUFFER);
      doc.font(FONT_NAME);

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fillColor(COLORS.primary).fontSize(28).text("Financial Report", { align: "center" });
      doc.moveDown(0.3);
      doc
        .fontSize(11)
        .fillColor(COLORS.secondary)
        .text(`Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, { align: "center" });
      doc.moveDown(1.5);

      doc.fontSize(10).fillColor(COLORS.secondary);
      doc.text(`User: ${userData.name ?? "Unknown"}`, MARGIN);
      doc.text(`Email: ${userData.email ?? "N/A"}`, MARGIN);
      doc.text(`Period: ${metrics.firstDate.toLocaleDateString()} – ${metrics.lastDate.toLocaleDateString()}`, MARGIN);
      doc.moveDown(1.5);

      drawCard(doc, "Financial Summary", 150, COLORS.accent);

      const summaryY = doc.y;
      const COL1 = 70;
      const COL2 = 320;

      const summaryRows: [string, string, string][] = [
        ["Total Income", formattedCurrency(metrics.income), COLORS.success],
        ["Total Expenses", formattedCurrency(metrics.expense), COLORS.danger],
        ["Net Balance", formattedCurrency(metrics.balance), metrics.balance >= 0 ? COLORS.success : COLORS.danger],
        ["Savings Rate", `${metrics.savingsRate.toFixed(1)}%`, COLORS.primary],
      ];

      summaryRows.forEach(([label, value, color], i) => {
        const ry = summaryY + i * 25;
        doc.fontSize(11).fillColor(COLORS.secondary).text(label, COL1, ry);
        doc.fillColor(color).text(value, COL2, ry, { align: "right", width: 200 });
      });

      doc.y = summaryY + 110;
      doc.moveDown(2);

      if (topCategories.length > 0) {
        drawCard(doc, "Top Spending Categories", 50 + topCategories.length * 25, COLORS.success);

        topCategories.forEach(([name, total], idx) => {
          const iy = doc.y;
          doc
            .fontSize(10)
            .fillColor(COLORS.secondary)
            .text(`${idx + 1}. ${name}`, 70, iy, { width: 300 });
          doc.fillColor(COLORS.primary).text(formattedCurrency(total), 70, iy, { align: "right", width: 450 });
          doc.y = iy + 25;
        });

        doc.moveDown(2);
      }

      doc.addPage();
      doc.fontSize(16).fillColor(COLORS.primary).text("Transaction History", MARGIN, MARGIN);
      doc.moveDown(1);

      if (userData.transactions.length === 0) {
        doc.fontSize(11).fillColor(COLORS.secondary).text("No transactions found.", { align: "center" });
      } else {
        drawTableHeader(doc);

        userData.transactions.forEach((t, idx) => {
          if (doc.y > PAGE_HEIGHT - 80) {
            doc.addPage();
            doc.y = MARGIN;
            drawTableHeader(doc);
          }
          drawTableRow(doc, t, idx);
        });
      }

      const total = doc.bufferedPageRange().count;
      for (let i = 0; i < total; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .fillColor(COLORS.secondary)
          .text(`Page ${i + 1} of ${total}`, MARGIN, PAGE_HEIGHT - 40, { align: "center", width: CONTENT_W });
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

    const transactions: Transaction[] = (userData.transactions ?? []).map((t) => ({
      id: t.id,
      date: t.date,
      type: t.type,
      amount: Number(t.amount),
      category: t.category ? { name: t.category.name } : null,
      account: t.account ? { name: t.account.name } : null,
    }));

    const metrics = calculateMetrics(transactions);
    const topCategories = getTopCategories(transactions);

    const pdfBuffer = await generatePDF({ name: userData.name, email: userData.email, transactions }, metrics, topCategories);

    const filename = `finarthax-${new Date().toISOString().split("T")[0]}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[PDF Export]", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") return errorResponse("Unauthorized", 401);
      if (error.message.startsWith("Font")) return errorResponse("PDF generation failed: font asset missing from deployment. Ensure public/fonts/SpaceGrotesk-Regular.ttf is committed.", 500);
      if (error.message.includes("User not found")) return errorResponse("User not found", 404);
    }

    return errorResponse("An unexpected error occurred while generating the PDF.", 500);
  }
}
