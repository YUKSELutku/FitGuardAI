// Builds a 1-slide presentation explaining the Personal Health Panel step.
const path = require("path");
const GLOBAL_NM = "C:/Users/Utku35/AppData/Roaming/npm/node_modules";
const pptxgen = require(path.join(GLOBAL_NM, "pptxgenjs"));

// --- Palette (same as main deck) -----------------------------------------
const C = {
  navy: "0B1729",
  navyDeep: "060C18",
  mint: "10B981",
  mintDark: "0F9E6E",
  cyan: "06B6D4",
  cyanDark: "0891B2",
  coral: "F97066",
  amber: "F59E0B",
  offwhite: "F8FAFC",
  paper: "FFFFFF",
  slate900: "0F172A",
  slate700: "334155",
  slate500: "64748B",
  slate200: "E2E8F0",
  slate100: "F1F5F9",
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "FitGuard AI";
pres.title = "FitGuard AI — Kişisel Sağlık Paneli";
const SW = 13.3, SH = 7.5;

async function build() {
  const sl = pres.addSlide();
  sl.background = { color: C.offwhite };

  // ---------- Left mint accent bar ---------------------------------------
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.22, h: SH,
    fill: { color: C.mint }, line: { color: C.mint },
  });

  // ---------- Header -----------------------------------------------------
  sl.addText("PROJENİN EN TEMEL FARKI", {
    x: 0.6, y: 0.45, w: 10, h: 0.35, fontSize: 12, fontFace: "Calibri",
    color: C.mint, bold: true, charSpacing: 6, margin: 0,
  });

  sl.addText("Kişisel Sağlık Paneli", {
    x: 0.6, y: 0.8, w: 12, h: 0.85, fontSize: 38, fontFace: "Calibri",
    color: C.slate900, bold: true, margin: 0,
  });

  sl.addText(
    "Kullanıcının kronik rahatsızlıklarına ve fiziksel kısıtlarına göre güvenli egzersiz sınırları anlık olarak kişiselleştirilir.",
    {
      x: 0.6, y: 1.65, w: 12, h: 0.6, fontSize: 15, fontFace: "Calibri",
      color: C.slate700, italic: true, margin: 0,
    }
  );

  // ---------- 3-step flow: USER → MedGemma → SAFE LIMITS -----------------
  // Column geometry
  const colY = 2.7;
  const colH = 3.6;
  const col1X = 0.6, col1W = 3.9;
  const col2X = 4.8, col2W = 3.7;
  const col3X = 8.8, col3W = 3.9;

  // --- COLUMN 1 — User input ---------------------------------------------
  sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: col1X, y: colY, w: col1W, h: colH, rectRadius: 0.12,
    fill: { color: C.paper }, line: { color: C.slate200, width: 1 },
    shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 90, opacity: 0.08 },
  });

  // Step badge
  sl.addShape(pres.shapes.OVAL, {
    x: col1X + 0.25, y: colY + 0.3, w: 0.55, h: 0.55,
    fill: { color: C.mint }, line: { color: C.mint },
  });
  sl.addText("1", {
    x: col1X + 0.25, y: colY + 0.3, w: 0.55, h: 0.55, fontSize: 20,
    color: C.paper, bold: true, align: "center", valign: "middle",
    fontFace: "Calibri", margin: 0,
  });

  sl.addText("KULLANICI GİRDİSİ", {
    x: col1X + 0.95, y: colY + 0.32, w: 2.8, h: 0.25, fontSize: 10,
    color: C.slate500, bold: true, charSpacing: 3, fontFace: "Calibri", margin: 0,
  });
  sl.addText("Şikayetiniz var mı?", {
    x: col1X + 0.95, y: colY + 0.55, w: 2.8, h: 0.35, fontSize: 16,
    color: C.slate900, bold: true, fontFace: "Calibri", margin: 0,
  });

  // Example complaints as pill bubbles
  const complaints = [
    '"Bel fıtığım var"',
    '"Dizimde menisküs yırtığı"',
    '"Omuz sıkışması"',
    '"Kronik diz ağrısı"',
  ];
  let cy = colY + 1.15;
  for (const txt of complaints) {
    sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: col1X + 0.3, y: cy, w: col1W - 0.6, h: 0.5, rectRadius: 0.08,
      fill: { color: C.slate100 }, line: { color: C.slate200, width: 1 },
    });
    sl.addText(txt, {
      x: col1X + 0.5, y: cy, w: col1W - 1.0, h: 0.5, fontSize: 13,
      color: C.slate700, italic: true, fontFace: "Georgia",
      valign: "middle", margin: 0,
    });
    cy += 0.58;
  }

  // --- ARROW 1 -----------------------------------------------------------
  sl.addShape(pres.shapes.RIGHT_TRIANGLE, {
    x: col1X + col1W + 0.1, y: colY + 1.55, w: 0.6, h: 0.5,
    fill: { color: C.mint }, line: { color: C.mint },
    rotate: 90,
  });

  // --- COLUMN 2 — MedGemma (dark, emphasized) ----------------------------
  sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: col2X, y: colY, w: col2W, h: colH, rectRadius: 0.12,
    fill: { color: C.navy }, line: { color: C.navy },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 3, angle: 90, opacity: 0.18 },
  });

  // Step badge (cyan on navy)
  sl.addShape(pres.shapes.OVAL, {
    x: col2X + 0.25, y: colY + 0.3, w: 0.55, h: 0.55,
    fill: { color: C.cyan }, line: { color: C.cyan },
  });
  sl.addText("2", {
    x: col2X + 0.25, y: colY + 0.3, w: 0.55, h: 0.55, fontSize: 20,
    color: C.navy, bold: true, align: "center", valign: "middle",
    fontFace: "Calibri", margin: 0,
  });

  sl.addText("TIBBİ YAPAY ZEKA", {
    x: col2X + 0.95, y: colY + 0.32, w: 2.5, h: 0.25, fontSize: 10,
    color: C.cyan, bold: true, charSpacing: 3, fontFace: "Calibri", margin: 0,
  });
  sl.addText("MedGemma", {
    x: col2X + 0.95, y: colY + 0.55, w: 2.5, h: 0.45, fontSize: 22,
    color: C.offwhite, bold: true, fontFace: "Calibri", margin: 0,
  });

  // Brain / lightbulb visual — concentric circles
  sl.addShape(pres.shapes.OVAL, {
    x: col2X + col2W / 2 - 1.0, y: colY + 1.25, w: 2.0, h: 2.0,
    fill: { color: C.mint, transparency: 80 }, line: { color: C.mint, width: 1 },
  });
  sl.addShape(pres.shapes.OVAL, {
    x: col2X + col2W / 2 - 0.7, y: colY + 1.55, w: 1.4, h: 1.4,
    fill: { color: C.cyan, transparency: 60 }, line: { color: C.cyan, width: 1 },
  });
  sl.addShape(pres.shapes.OVAL, {
    x: col2X + col2W / 2 - 0.4, y: colY + 1.85, w: 0.8, h: 0.8,
    fill: { color: C.mint }, line: { color: C.mint },
  });
  sl.addText("AI", {
    x: col2X + col2W / 2 - 0.4, y: colY + 1.85, w: 0.8, h: 0.8, fontSize: 22,
    color: C.navy, bold: true, align: "center", valign: "middle",
    fontFace: "Calibri", margin: 0,
  });

  // Tagline
  sl.addText("Klinik literatüre dayalı\ngüvenli açı analizi", {
    x: col2X + 0.3, y: colY + colH - 0.9, w: col2W - 0.6, h: 0.7, fontSize: 12,
    color: C.slate200, italic: true, align: "center",
    fontFace: "Calibri", margin: 0,
  });

  // --- ARROW 2 -----------------------------------------------------------
  sl.addShape(pres.shapes.RIGHT_TRIANGLE, {
    x: col2X + col2W + 0.1, y: colY + 1.55, w: 0.6, h: 0.5,
    fill: { color: C.mint }, line: { color: C.mint },
    rotate: 90,
  });

  // --- COLUMN 3 — Personalized output ------------------------------------
  sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: col3X, y: colY, w: col3W, h: colH, rectRadius: 0.12,
    fill: { color: C.paper }, line: { color: C.mint, width: 2 },
    shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 90, opacity: 0.08 },
  });

  // Step badge
  sl.addShape(pres.shapes.OVAL, {
    x: col3X + 0.25, y: colY + 0.3, w: 0.55, h: 0.55,
    fill: { color: C.mint }, line: { color: C.mint },
  });
  sl.addText("3", {
    x: col3X + 0.25, y: colY + 0.3, w: 0.55, h: 0.55, fontSize: 20,
    color: C.paper, bold: true, align: "center", valign: "middle",
    fontFace: "Calibri", margin: 0,
  });

  sl.addText("KİŞİSEL SINIRLAR", {
    x: col3X + 0.95, y: colY + 0.32, w: 2.8, h: 0.25, fontSize: 10,
    color: C.slate500, bold: true, charSpacing: 3, fontFace: "Calibri", margin: 0,
  });
  sl.addText("Size özel güvenli açı", {
    x: col3X + 0.95, y: colY + 0.55, w: 2.8, h: 0.35, fontSize: 16,
    color: C.slate900, bold: true, fontFace: "Calibri", margin: 0,
  });

  // Example output — joint + angle range
  const outputs = [
    { joint: "Diz", range: "min 90° — max 140°", color: C.mint },
    { joint: "Kalça", range: "min 70° — max 110°", color: C.cyan },
    { joint: "Bel", range: "min 160° — max 180°", color: C.amber },
  ];
  let oy = colY + 1.2;
  for (const o of outputs) {
    // Small color dot
    sl.addShape(pres.shapes.OVAL, {
      x: col3X + 0.3, y: oy + 0.1, w: 0.25, h: 0.25,
      fill: { color: o.color }, line: { color: o.color },
    });
    sl.addText(o.joint, {
      x: col3X + 0.65, y: oy, w: 1.1, h: 0.45, fontSize: 14,
      color: C.slate900, bold: true, fontFace: "Calibri",
      valign: "middle", margin: 0,
    });
    sl.addText(o.range, {
      x: col3X + 1.8, y: oy, w: col3W - 2.0, h: 0.45, fontSize: 13,
      color: C.slate700, fontFace: "Consolas",
      valign: "middle", margin: 0,
    });
    oy += 0.6;
  }

  // Footer note in card
  sl.addShape(pres.shapes.RECTANGLE, {
    x: col3X + 0.3, y: colY + colH - 0.7, w: col3W - 0.6, h: 0.04,
    fill: { color: C.slate200 }, line: { color: C.slate200 },
  });
  sl.addText("✓ Anlık oluşturulur  ·  ✓ Tamamen yerel", {
    x: col3X + 0.3, y: colY + colH - 0.55, w: col3W - 0.6, h: 0.35, fontSize: 11,
    color: C.mint, bold: true, align: "center",
    fontFace: "Calibri", margin: 0,
  });

  // ---------- Bottom key message -----------------------------------------
  sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 6.55, w: 12.1, h: 0.65, rectRadius: 0.1,
    fill: { color: C.navy }, line: { color: C.navy },
  });
  sl.addText(
    "Diğer uygulamalar herkese aynı kuralı dayatır.  FitGuard AI sizin bedeninize, sizin hikayenize göre karar verir.",
    {
      x: 0.6, y: 6.55, w: 12.1, h: 0.65, fontSize: 14, fontFace: "Calibri",
      color: C.offwhite, bold: true, italic: true, align: "center",
      valign: "middle", margin: 0,
    }
  );

  // ---------- Footer -----------------------------------------------------
  sl.addText("FitGuard AI  ·  TEKNOFEST 2026", {
    x: 0.6, y: SH - 0.32, w: 8, h: 0.25, fontSize: 9,
    color: C.slate500, fontFace: "Calibri", margin: 0,
  });
  sl.addText("Kişisel Sağlık Paneli", {
    x: SW - 3.2, y: SH - 0.32, w: 2.6, h: 0.25, fontSize: 9,
    color: C.slate500, fontFace: "Calibri", align: "right", margin: 0,
  });

  const out = "C:/Users/Utku35/Desktop/teknofest/Araştırma Projesi/Yeni klasör/sunum/FitGuardAI_Kisisel_Saglik_Paneli.pptx";
  await pres.writeFile({ fileName: out });
  console.log("WROTE:", out);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
