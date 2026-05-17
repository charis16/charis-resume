import { getProfile } from "@/data/profile-store";
import { getLocale } from "@/i18n/server-locale";
import { pick, pickArray } from "@/i18n/value";
import { t } from "@/i18n/messages";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return null;
    const arr = await res.arrayBuffer();
    if (arr.byteLength > 2_500_000) return null;
    return Buffer.from(arr);
  } catch {
    return null;
  }
}

function toSafeFilename(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

async function buildPdf(): Promise<Buffer> {
  const locale = await getLocale();
  const profile = await getProfile();

  const doc = new PDFDocument({
    size: "A4",
    margin: 36,
    info: { Title: `${profile.name} - Resume` },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c as Buffer));

  const margin = 36;
  const leftW = 250;
  const gap = 28;
  const avatarSize = 150;

  const avatar = profile.avatarUrl
    ? await fetchImageBuffer(profile.avatarUrl)
    : null;
  const aboutText = pick(locale, profile.about);
  const emailHref = profile.links.find((l) =>
    l.href.startsWith("mailto:"),
  )?.href;
  const emailText = emailHref?.replace("mailto:", "");
  const linkedinHref = profile.links.find((l) =>
    l.label.toLowerCase().includes("linkedin"),
  )?.href;

  const layout = () => {
    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const contentH = pageH - margin * 2;
    const leftX = margin;
    const rightX = leftX + leftW + gap;
    const rightW = pageW - margin - rightX;
    const bottomY = margin + contentH - 36;
    return { pageW, pageH, contentH, leftX, rightX, rightW, bottomY };
  };

  const truncateToHeight = (text: string, maxHeight: number, width: number) => {
    if (!text) return "";
    const fits = doc.heightOfString(text, { width, lineGap: 3 }) <= maxHeight;
    if (fits) return text;

    const words = text.split(/\s+/).filter(Boolean);
    let lo = 0;
    let hi = words.length;
    let best = "";
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const candidate = `${words.slice(0, mid).join(" ")}…`;
      const h = doc.heightOfString(candidate, { width, lineGap: 3 });
      if (h <= maxHeight) {
        best = candidate;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return best || `${words[0]}…`;
  };

  const drawSectionDivider = (x: number, y: number, w: number) => {
    doc.save();
    doc
      .strokeColor("#111111")
      .lineWidth(1)
      .moveTo(x, y)
      .lineTo(x + w, y)
      .stroke();
    doc.restore();
  };

  const renderLeftPanel = () => {
    const { leftX, contentH } = layout();
    doc.save();
    doc.rect(leftX, margin, leftW, contentH).fill("#f4f4f4");
    doc.restore();

    const avatarX = leftX + (leftW - avatarSize) / 2;
    let y = margin + 22;
    if (avatar) {
      doc.save();
      doc
        .circle(avatarX + avatarSize / 2, y + avatarSize / 2, avatarSize / 2)
        .clip();
      doc.image(avatar, avatarX, y, { width: avatarSize, height: avatarSize });
      doc.restore();
    } else {
      doc.save();
      doc
        .circle(avatarX + avatarSize / 2, y + avatarSize / 2, avatarSize / 2)
        .fill("#ffffff");
      doc.fillColor("#111111");
      doc.font("Helvetica-Bold").fontSize(34);
      doc.text(initials(profile.name), avatarX, y + 52, {
        width: avatarSize,
        align: "center",
      });
      doc.restore();
    }

    y += avatarSize + 26;

    doc.fillColor("#111111");
    doc.font("Helvetica-Bold").fontSize(16);
    doc.text("Profile Info", leftX + 20, y, { width: leftW - 40 });
    y += 36;
    drawSectionDivider(leftX + 20, y - 12, leftW - 40);

    doc.fillColor("#333333");
    doc.font("Helvetica").fontSize(10.5);
    const maxAboutHeight = 250;
    const about = truncateToHeight(aboutText, maxAboutHeight, leftW - 40);
    doc.text(about, leftX + 20, y, { width: leftW - 40, lineGap: 3 });
    y = doc.y + 16;

    doc.fillColor("#555555");
    doc.font("Helvetica-Bold").fontSize(10.5);
    doc.text(profile.location, leftX + 20, y, { width: leftW - 40 });
    y += 26;

    doc.fillColor("#111111");
    doc.font("Helvetica-Bold").fontSize(16);
    doc.text("Skills", leftX + 20, y, { width: leftW - 40 });
    y += 36;
    drawSectionDivider(leftX + 20, y - 12, leftW - 40);

    doc.fillColor("#555555");
    doc.font("Helvetica-Bold").fontSize(10.5);
    const { bottomY } = layout();
    const lineH = 16;
    const maxLines = Math.max(0, Math.floor((bottomY - y) / lineH));
    const skills = profile.skills.slice(0, maxLines);
    for (const s of skills) {
      doc.text(s, leftX + 24, y, { width: leftW - 48 });
      y += lineH;
    }
  };

  const renderRightHeader = (variant: "first" | "next") => {
    const { rightX, rightW } = layout();
    let y = margin + 18;

    doc.fillColor("#111111");
    doc.font("Helvetica-Bold").fontSize(variant === "first" ? 28 : 18);
    doc.text(profile.name, rightX, y, { width: rightW });
    y = doc.y + (variant === "first" ? 4 : 2);

    doc.fillColor("#444444");
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text(profile.headline.toUpperCase(), rightX, y, {
      width: rightW,
      characterSpacing: 3,
    });
    y = doc.y + 14;

    drawSectionDivider(rightX, y, rightW);
    y += 14;

    const colW = (rightW - 18) / 2;
    doc.fillColor("#666666");
    doc.font("Helvetica-Bold").fontSize(9);
    doc.text(t(locale, "contactEmail"), rightX, y, { width: colW });
    doc.text(t(locale, "contactLinkedIn"), rightX + colW + 18, y, {
      width: colW,
    });
    y += 12;

    doc.fillColor("#222222");
    doc.font("Helvetica").fontSize(10);
    doc.text(emailText ?? "-", rightX, y, { width: colW });
    doc.text(
      linkedinHref
        ? linkedinHref.replace(/^https?:\/\//, "").replace(/^www\./, "")
        : "-",
      rightX + colW + 18,
      y,
      { width: colW },
    );
    y += 32;

    return y;
  };

  const renderRightSectionTitle = (title: string, rightY: number) => {
    const { rightX, rightW } = layout();
    doc.fillColor("#111111");
    doc.font("Helvetica-Bold").fontSize(18);
    doc.text(title, rightX, rightY, { width: rightW });
    rightY += 36;
    drawSectionDivider(rightX, rightY - 12, rightW);
    return rightY + 14;
  };

  let pageIndex = 0;
  let rightY = 0;
  let currentSection = "";
  const presentLabel = locale === "id" ? "Sekarang" : "Present";

  const startPage = (sectionTitle?: string) => {
    if (pageIndex > 0) doc.addPage({ margin });
    pageIndex += 1;
    renderLeftPanel();
    rightY = renderRightHeader(pageIndex === 1 ? "first" : "next");
    if (sectionTitle) {
      currentSection = sectionTitle;
      rightY = renderRightSectionTitle(sectionTitle, rightY);
    } else if (currentSection) {
      rightY = renderRightSectionTitle(currentSection, rightY);
    }
  };

  const ensureSpace = (neededHeight: number) => {
    const { bottomY } = layout();
    if (rightY + neededHeight <= bottomY) return;
    startPage();
  };

  const estimateExperienceHeight = (
    item: (typeof profile.experience)[number],
  ) => {
    const { rightW } = layout();
    const dateText = `${item.start} - ${item.current || !item.end ? presentLabel : item.end}`;

    doc.font("Helvetica-Bold").fontSize(11.5);
    const roleHeight = doc.heightOfString(item.role, { width: rightW - 120 });
    doc.font("Helvetica-Bold").fontSize(10);
    const dateHeight = doc.heightOfString(dateText, {
      width: 120,
      align: "right",
    });

    doc.font("Helvetica-Bold").fontSize(10);
    const companyText = `${item.company} | ${item.location}`;
    const companyHeight = doc.heightOfString(companyText, { width: rightW });

    doc.font("Helvetica").fontSize(10.2);
    const highlights = pickArray(locale, item.highlights);
    const bulletsHeight = highlights.reduce((sum, h) => {
      return (
        sum + doc.heightOfString(`• ${h}`, { width: rightW, lineGap: 2 }) + 2
      );
    }, 0);

    return (
      Math.max(roleHeight, dateHeight) +
      3 +
      companyHeight +
      6 +
      bulletsHeight +
      16
    );
  };

  const renderExperienceItem = (item: (typeof profile.experience)[number]) => {
    const { rightX, rightW } = layout();
    const headerY = rightY;
    const dateText = `${item.start} - ${item.current || !item.end ? presentLabel : item.end}`;

    doc.font("Helvetica-Bold").fontSize(11.5);
    const roleHeight = doc.heightOfString(item.role, { width: rightW - 120 });
    doc.font("Helvetica-Bold").fontSize(10);
    const dateHeight = doc.heightOfString(dateText, {
      width: 120,
      align: "right",
    });

    doc.fillColor("#111111");
    doc.font("Helvetica-Bold").fontSize(11.5);
    doc.text(item.role, rightX, headerY, { width: rightW - 120 });

    doc.fillColor("#555555");
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text(dateText, rightX + rightW - 120, headerY, {
      width: 120,
      align: "right",
    });

    rightY = headerY + Math.max(roleHeight, dateHeight) + 3;

    doc.fillColor("#444444");
    doc.font("Helvetica-Bold").fontSize(10);
    const companyText = `${item.company} | ${item.location}`;
    const companyHeight = doc.heightOfString(companyText, { width: rightW });
    doc.text(companyText, rightX, rightY, { width: rightW });
    rightY += companyHeight + 6;

    doc.fillColor("#222222");
    doc.font("Helvetica").fontSize(10.2);
    const highlights = pickArray(locale, item.highlights);
    for (const h of highlights) {
      doc.text(`• ${h}`, rightX, rightY, { width: rightW, lineGap: 2 });
      rightY = doc.y + 2;
    }
    rightY += 10;
  };

  const estimateEducationHeight = (e: (typeof profile.education)[number]) => {
    const { rightW } = layout();
    const dateText = `${e.start} - ${e.end}`;
    doc.font("Helvetica-Bold").fontSize(11.5);
    const majorHeight = doc.heightOfString(e.major, { width: rightW - 120 });
    doc.font("Helvetica-Bold").fontSize(10);
    const dateHeight = doc.heightOfString(dateText, {
      width: 120,
      align: "right",
    });
    doc.font("Helvetica-Bold").fontSize(10);
    const schoolHeight = doc.heightOfString(e.school, { width: rightW });
    doc.font("Helvetica").fontSize(10.2);
    const noteHeight = e.note
      ? doc.heightOfString(e.note, { width: rightW, lineGap: 2 }) + 6
      : 0;
    return (
      Math.max(majorHeight, dateHeight) + 3 + schoolHeight + 6 + noteHeight + 16
    );
  };

  const renderEducationItem = (e: (typeof profile.education)[number]) => {
    const { rightX, rightW } = layout();
    const headerY = rightY;
    const dateText = `${e.start} - ${e.end}`;

    doc.font("Helvetica-Bold").fontSize(11.5);
    const majorHeight = doc.heightOfString(e.major, { width: rightW - 120 });
    doc.font("Helvetica-Bold").fontSize(10);
    const dateHeight = doc.heightOfString(dateText, {
      width: 120,
      align: "right",
    });

    doc.fillColor("#111111");
    doc.font("Helvetica-Bold").fontSize(11.5);
    doc.text(e.major, rightX, headerY, { width: rightW - 120 });

    doc.fillColor("#555555");
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text(dateText, rightX + rightW - 120, headerY, {
      width: 120,
      align: "right",
    });

    rightY = headerY + Math.max(majorHeight, dateHeight) + 3;

    doc.fillColor("#444444");
    doc.font("Helvetica-Bold").fontSize(10);
    const schoolHeight = doc.heightOfString(e.school, { width: rightW });
    doc.text(e.school, rightX, rightY, { width: rightW });
    rightY += schoolHeight + 6;

    if (e.note) {
      doc.fillColor("#222222");
      doc.font("Helvetica").fontSize(10.2);
      doc.text(e.note, rightX, rightY, { width: rightW, lineGap: 2 });
      rightY = doc.y + 6;
    }
    rightY += 10;
  };

  startPage("Experience");
  for (const item of profile.experience) {
    ensureSpace(estimateExperienceHeight(item));
    renderExperienceItem(item);
  }

  currentSection = "Educations";
  rightY = renderRightSectionTitle("Educations", rightY);
  for (const e of profile.education) {
    ensureSpace(estimateEducationHeight(e));
    renderEducationItem(e);
  }

  doc.end();

  return await new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));
  });
}

export async function GET() {
  const profile = await getProfile();
  const filename = `resume-${toSafeFilename(profile.name) || "resume"}.pdf`;
  const pdf = await buildPdf();

  return new Response(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
