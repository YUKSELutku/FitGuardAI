// Builds a short 2-slide opening presentation for FitGuard AI.
const path = require("path");
const GLOBAL_NM = "C:/Users/Utku35/AppData/Roaming/npm/node_modules";
const pptxgen = require(path.join(GLOBAL_NM, "pptxgenjs"));

// --- Palette (coherent with main deck) -----------------------------------
const C = {
  navy: "0B1729",
  navyDeep: "060C18",
  mint: "10B981",
  mintDark: "0F9E6E",
  cyan: "06B6D4",
  coral: "F97066",
  amber: "F59E0B",
  offwhite: "F8FAFC",
  slate900: "0F172A",
  slate700: "334155",
  slate500: "64748B",
  slate200: "E2E8F0",
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "FitGuard AI";
pres.title = "FitGuard AI — Açılış";
const SW = 13.3, SH = 7.5;

async function build() {
  // ======================================================================
  // SLIDE 1 — THE QUESTION (dark, cinematic)
  // ======================================================================
  {
    const sl = pres.addSlide();
    sl.background = { color: C.navy };

    // Decorative corner circles
    sl.addShape(pres.shapes.OVAL, {
      x: -2.5, y: -2.5, w: 6, h: 6,
      fill: { color: C.mint, transparency: 85 }, line: { color: C.navy },
    });
    sl.addShape(pres.shapes.OVAL, {
      x: SW - 2.5, y: SH - 2.5, w: 5, h: 5,
      fill: { color: C.cyan, transparency: 88 }, line: { color: C.navy },
    });

    // Kicker
    sl.addText("FITGUARD AI · AÇILIŞ", {
      x: 0.8, y: 0.6, w: 10, h: 0.4, fontSize: 12, fontFace: "Calibri",
      color: C.mint, bold: true, charSpacing: 6, margin: 0,
    });

    // Decorative big quote mark
    sl.addText('"', {
      x: 0.6, y: 1.0, w: 2, h: 2.5, fontSize: 220, fontFace: "Georgia",
      color: C.mint, bold: true, margin: 0, valign: "top",
    });

    // The question
    sl.addText("Son bir yılda egzersiz yaparken,", {
      x: 1.0, y: 2.4, w: 11.5, h: 0.9, fontSize: 36, fontFace: "Calibri",
      color: C.offwhite, bold: true, margin: 0,
    });

    sl.addText('"Acaba bu hareketi doğru mu yapıyorum?"', {
      x: 1.0, y: 3.3, w: 11.5, h: 0.9, fontSize: 36, fontFace: "Georgia",
      color: C.mint, italic: true, bold: true, margin: 0,
    });

    sl.addText("diye kaç kez tereddüt ettiniz?", {
      x: 1.0, y: 4.2, w: 11.5, h: 0.9, fontSize: 36, fontFace: "Calibri",
      color: C.offwhite, bold: true, margin: 0,
    });

    // Divider
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 1.0, y: 5.5, w: 0.8, h: 0.06,
      fill: { color: C.mint }, line: { color: C.mint },
    });

    // Small subtext
    sl.addText("Yalnız değilsiniz.", {
      x: 1.0, y: 5.7, w: 10, h: 0.5, fontSize: 20, fontFace: "Calibri",
      color: C.slate200, margin: 0,
    });

    // Footer
    sl.addText("FitGuard AI  ·  TEKNOFEST 2026", {
      x: 0.8, y: SH - 0.45, w: 8, h: 0.3, fontSize: 10,
      color: C.slate500, fontFace: "Calibri", margin: 0,
    });
    sl.addText("1 / 2", {
      x: SW - 1.2, y: SH - 0.45, w: 0.6, h: 0.3, fontSize: 10,
      color: C.slate500, fontFace: "Calibri", align: "right", margin: 0,
    });
  }

  // ======================================================================
  // SLIDE 2 — THE STAT + CALL (light, impactful)
  // ======================================================================
  {
    const sl = pres.addSlide();
    sl.background = { color: C.offwhite };

    // Left mint accent bar
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 0.22, h: SH,
      fill: { color: C.mint }, line: { color: C.mint },
    });

    // Kicker
    sl.addText("GERÇEK", {
      x: 0.6, y: 0.5, w: 8, h: 0.35, fontSize: 12, fontFace: "Calibri",
      color: C.mint, bold: true, charSpacing: 6, margin: 0,
    });

    // Headline
    sl.addText("Yalnız değilsiniz.", {
      x: 0.6, y: 0.85, w: 12, h: 0.8, fontSize: 32, fontFace: "Calibri",
      color: C.slate900, bold: true, margin: 0,
    });

    // Left column — the big number
    sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 2.1, w: 5.7, h: 4.2, rectRadius: 0.15,
      fill: { color: C.navy }, line: { color: C.navy },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 3, angle: 90, opacity: 0.15 },
    });

    sl.addText("500.000+", {
      x: 0.6, y: 2.5, w: 5.7, h: 1.6, fontSize: 88, fontFace: "Calibri",
      color: C.mint, bold: true, align: "center", valign: "middle", margin: 0,
    });

    sl.addText("kişi geçen yıl egzersiz sırasında yaralandı", {
      x: 0.8, y: 4.1, w: 5.3, h: 0.7, fontSize: 18, fontFace: "Calibri",
      color: C.offwhite, align: "center", margin: 0,
    });

    // Small divider inside card
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 2.7, y: 4.95, w: 1.5, h: 0.04,
      fill: { color: C.mint }, line: { color: C.mint },
    });

    sl.addText("Dünya genelinde", {
      x: 0.8, y: 5.1, w: 5.3, h: 0.4, fontSize: 12, fontFace: "Calibri",
      color: C.slate200, align: "center", charSpacing: 3, margin: 0,
    });

    sl.addText("Ağır antrenmandan değil —\nyanlış duruştan, yanlış açıdan,\nküçük hatalardan.", {
      x: 0.8, y: 5.55, w: 5.3, h: 0.9, fontSize: 13, fontFace: "Georgia",
      color: C.offwhite, italic: true, align: "center", margin: 0,
    });

    // Right column — the solution
    sl.addText("ÇÖZÜM", {
      x: 6.7, y: 2.1, w: 6, h: 0.35, fontSize: 12, fontFace: "Calibri",
      color: C.mint, bold: true, charSpacing: 6, margin: 0,
    });

    sl.addText("FitGuard AI", {
      x: 6.7, y: 2.45, w: 6, h: 1.0, fontSize: 54, fontFace: "Calibri",
      color: C.slate900, bold: true, margin: 0,
    });

    // Mint underline
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 6.7, y: 3.6, w: 1.2, h: 0.08,
      fill: { color: C.mint }, line: { color: C.mint },
    });

    sl.addText(
      "Küçük hataları büyük problemlere dönüşmeden yakalayan, yapay zeka destekli gerçek zamanlı form analiz sistemi.",
      {
        x: 6.7, y: 3.85, w: 6, h: 1.5, fontSize: 16, fontFace: "Calibri",
        color: C.slate700, margin: 0,
      }
    );

    // Three pills: core promise
    const pills = [
      { label: "Gerçek zamanlı", color: C.mint },
      { label: "Kişiselleştirilmiş", color: C.cyan },
      { label: "%100 yerel", color: C.amber },
    ];
    let px = 6.7;
    for (const p of pills) {
      sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: px, y: 5.5, w: 1.85, h: 0.5, rectRadius: 0.25,
        fill: { color: p.color }, line: { color: p.color },
      });
      sl.addText(p.label, {
        x: px, y: 5.5, w: 1.85, h: 0.5, fontSize: 11, fontFace: "Calibri",
        color: "FFFFFF", bold: true, align: "center", valign: "middle", margin: 0,
      });
      px += 2.0;
    }

    // Footer
    sl.addText("FitGuard AI  ·  TEKNOFEST 2026", {
      x: 0.6, y: SH - 0.45, w: 8, h: 0.3, fontSize: 10,
      color: C.slate500, fontFace: "Calibri", margin: 0,
    });
    sl.addText("2 / 2", {
      x: SW - 1.2, y: SH - 0.45, w: 0.6, h: 0.3, fontSize: 10,
      color: C.slate500, fontFace: "Calibri", align: "right", margin: 0,
    });
  }

  const out = "C:/Users/Utku35/Desktop/teknofest/Araştırma Projesi/Yeni klasör/sunum/FitGuardAI_Acilis.pptx";
  await pres.writeFile({ fileName: out });
  console.log("WROTE:", out);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
