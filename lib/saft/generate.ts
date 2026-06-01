import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { User } from "@/db/schema/users";
import type { BplayPurchase } from "@/db/schema/bplay-purchases";
import { formatLongDate } from "@/lib/utils";
import { SAFT_BLOCKS, type SaftBlock } from "./template";

export interface SaftData {
  agreementDate: string;
  recipientName: string;
  recipientNationality: string;
  recipientAddress: string;
  recipientDateOfBirth: string;
  recipientIdNumber: string;
  recipientEmail: string;
  purchaseAmount: string;
  tokenAmount: string;
  pricePerToken: string;
}

const BLANK = "________________";

const usd = (value: number, maxFractionDigits = 2): string =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: maxFractionDigits,
  });

export const buildSaftData = (user: User, purchase: BplayPurchase): SaftData => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const usdcAmount = parseFloat(purchase.usdcAmount);
  const tokenAmount = parseFloat(purchase.bplayAmount);
  const pricePerToken = tokenAmount > 0 ? usdcAmount / tokenAmount : 0;
  const address = [user.address, user.country].filter(Boolean).join(", ");

  return {
    agreementDate: formatLongDate(purchase.createdAt) || BLANK,
    recipientName: fullName || user.name || BLANK,
    recipientNationality: user.country || BLANK,
    recipientAddress: address || BLANK,
    recipientDateOfBirth: user.dateOfBirth ? formatLongDate(user.dateOfBirth) : BLANK,
    recipientIdNumber: BLANK,
    recipientEmail: user.email,
    purchaseAmount: `${usd(usdcAmount)} (USDC)`,
    tokenAmount: tokenAmount.toLocaleString("en-US", { maximumFractionDigits: 6 }),
    pricePerToken: usd(pricePerToken, 6),
  };
};

const fillPlaceholders = (text: string, data: SaftData): string =>
  text
    .replace(/\{\{AGREEMENT_DATE\}\}/g, data.agreementDate)
    .replace(/\{\{RECIPIENT_NAME\}\}/g, data.recipientName)
    .replace(/\{\{RECIPIENT_NATIONALITY\}\}/g, data.recipientNationality)
    .replace(/\{\{RECIPIENT_ADDRESS\}\}/g, data.recipientAddress)
    .replace(/\{\{RECIPIENT_DATE_OF_BIRTH\}\}/g, data.recipientDateOfBirth)
    .replace(/\{\{RECIPIENT_ID_NUMBER\}\}/g, data.recipientIdNumber)
    .replace(/\{\{RECIPIENT_EMAIL\}\}/g, data.recipientEmail)
    .replace(/\{\{PURCHASE_AMOUNT\}\}/g, data.purchaseAmount)
    .replace(/\{\{TOKEN_AMOUNT\}\}/g, data.tokenAmount)
    .replace(/\{\{PRICE_PER_TOKEN\}\}/g, data.pricePerToken);

// Standard PDF fonts use WinAnsi encoding; normalise smart punctuation and drop
// any code point it cannot represent so generation never throws.
const sanitize = (text: string): string =>
  text
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    .replace(/[^\x00-\xFF]/g, "?");

interface BlockStyle {
  size: number;
  bold: boolean;
  indent: number;
  spaceBefore: number;
  spaceAfter: number;
  align: "left" | "center";
}

const styleFor = (kind: SaftBlock["kind"]): BlockStyle => {
  switch (kind) {
    case "title":
      return { size: 22, bold: true, indent: 0, spaceBefore: 0, spaceAfter: 4, align: "center" };
    case "subtitle":
      return { size: 13, bold: true, indent: 0, spaceBefore: 0, spaceAfter: 16, align: "center" };
    case "heading":
      return { size: 11, bold: true, indent: 0, spaceBefore: 12, spaceAfter: 4, align: "left" };
    case "list":
      return { size: 10, bold: false, indent: 22, spaceBefore: 1, spaceAfter: 2, align: "left" };
    case "paragraph":
    default:
      return { size: 10, bold: false, indent: 0, spaceBefore: 4, spaceAfter: 2, align: "left" };
  }
};

const wrapText = (text: string, font: PDFFont, size: number, maxWidth: number): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const TEXT_COLOR = rgb(0.12, 0.12, 0.12);

export const generateSaftPdf = async (data: SaftData): Promise<Uint8Array> => {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursorY = PAGE_HEIGHT - MARGIN;

  const newPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    cursorY = PAGE_HEIGHT - MARGIN;
  };

  for (const block of SAFT_BLOCKS) {
    const style = styleFor(block.kind);
    const font = style.bold ? bold : regular;
    const lineHeight = style.size * 1.4;
    const text = sanitize(fillPlaceholders(block.text, data));
    const lines = wrapText(text, font, style.size, CONTENT_WIDTH - style.indent);

    cursorY -= style.spaceBefore;
    for (const line of lines) {
      if (cursorY - lineHeight < MARGIN) newPage();
      const x =
        style.align === "center"
          ? (PAGE_WIDTH - font.widthOfTextAtSize(line, style.size)) / 2
          : MARGIN + style.indent;
      page.drawText(line, { x, y: cursorY - style.size, size: style.size, font, color: TEXT_COLOR });
      cursorY -= lineHeight;
    }
    cursorY -= style.spaceAfter;
  }

  return pdf.save();
};

const pad = (value: number): string => String(value).padStart(2, "0");

export const buildSaftFilename = (purchase: BplayPurchase): string => {
  const d = new Date(purchase.createdAt);
  const datePart = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  const timePart = `${pad(d.getUTCHours())}-${pad(d.getUTCMinutes())}`;
  return `SAFT_${datePart}_${timePart}_${purchase.id}.pdf`;
};
