// Builds the FitGuard AI TEKNOFEST presentation.
const path = require("path");
const GLOBAL_NM = "C:/Users/Utku35/AppData/Roaming/npm/node_modules";
const pptxgen = require(path.join(GLOBAL_NM, "pptxgenjs"));
const React = require(path.join(GLOBAL_NM, "react"));
const ReactDOMServer = require(path.join(GLOBAL_NM, "react-dom/server"));
const sharp = require(path.join(GLOBAL_NM, "sharp"));
const FA = require(path.join(GLOBAL_NM, "react-icons/fa"));

// --- Palette ---------------------------------------------------------------
const C = {
  navy: "0B1729",        // deep background
  navyDeep: "060C18",
  navySoft: "1A2A44",
  mint: "10B981",        // primary accent (health)
  mintDark: "0F9E6E",
  cyan: "06B6D4",        // secondary accent (tech)
  cyanDark: "0891B2",
  coral: "F97066",       // danger/warning
  amber: "F59E0B",       // warning
  offwhite: "F8FAFC",    // light slide bg
  paper: "FFFFFF",
  slate900: "0F172A",    // headings on light
  slate700: "334155",    // body on light
  slate500: "64748B",    // muted
  slate200: "E2E8F0",    // borders
  slate100: "F1F5F9",    // card bg
};

// --- Icon helpers ----------------------------------------------------------
const iconCache = new Map();
async function icon(Comp, color = C.mint, size = 256) {
  const key = `${Comp.name}-${color}-${size}`;
  if (iconCache.has(key)) return iconCache.get(key);
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Comp, { color: "#" + color, size: String(size) })
  );
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  const data = "image/png;base64," + buf.toString("base64");
  iconCache.set(key, data);
  return data;
}

// --- Presentation ----------------------------------------------------------
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "FitGuard AI Team";
pres.title = "FitGuard AI — TEKNOFEST Sunumu";
const SW = 13.3, SH = 7.5;

// Shadow helper (fresh object each time)
const s = () => ({ type: "outer", color: "000000", blur: 8, offset: 2, angle: 90, opacity: 0.12 });

// Header band (for content slides)
function addHeader(slide, title, kicker) {
  // Left mint accent bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.22, h: SH, fill: { color: C.mint }, line: { color: C.mint },
  });
  // Kicker
  slide.addText(kicker, {
    x: 0.6, y: 0.35, w: 8, h: 0.35, fontSize: 12, fontFace: "Calibri",
    color: C.mint, bold: true, charSpacing: 4, margin: 0,
  });
  // Title
  slide.addText(title, {
    x: 0.6, y: 0.65, w: 12, h: 0.8, fontSize: 32, fontFace: "Calibri",
    color: C.slate900, bold: true, margin: 0,
  });
  // Thin divider under title area
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 1.5, w: 0.6, h: 0.06, fill: { color: C.mint }, line: { color: C.mint },
  });
}

// Footer (small, subtle)
function addFooter(slide, n, total) {
  slide.addText("FitGuard AI  ·  TEKNOFEST Araştırma Projesi", {
    x: 0.6, y: SH - 0.4, w: 8, h: 0.3, fontSize: 9, color: C.slate500, fontFace: "Calibri", margin: 0,
  });
  slide.addText(`${n} / ${total}`, {
    x: SW - 1.2, y: SH - 0.4, w: 0.6, h: 0.3, fontSize: 9, color: C.slate500,
    fontFace: "Calibri", align: "right", margin: 0,
  });
}

// ---------------------------------------------------------------------------
// BUILD
// ---------------------------------------------------------------------------
async function build() {
  const TOTAL = 14;

  // ----- SLIDE 1: COVER ----------------------------------------------------
  {
    const sl = pres.addSlide();
    sl.background = { color: C.navy };

    // Decorative corner circles
    sl.addShape(pres.shapes.OVAL, {
      x: -2, y: -2, w: 6, h: 6, fill: { color: C.mint, transparency: 85 }, line: { color: C.navy },
    });
    sl.addShape(pres.shapes.OVAL, {
      x: SW - 3, y: SH - 3, w: 6, h: 6, fill: { color: C.cyan, transparency: 88 }, line: { color: C.navy },
    });

    // Badge: TEKNOFEST
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 0.8, w: 2.6, h: 0.45, fill: { color: C.mint }, line: { color: C.mint },
    });
    sl.addText("TEKNOFEST 2026", {
      x: 0.8, y: 0.8, w: 2.6, h: 0.45, fontSize: 12, bold: true, color: C.navy,
      align: "center", valign: "middle", fontFace: "Calibri", charSpacing: 4, margin: 0,
    });

    // Big title
    sl.addText("FitGuard AI", {
      x: 0.8, y: 2.0, w: 12, h: 1.4, fontSize: 72, bold: true, color: C.offwhite,
      fontFace: "Calibri", margin: 0,
    });

    // Mint underline motif
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 3.5, w: 1.2, h: 0.08, fill: { color: C.mint }, line: { color: C.mint },
    });

    // Subtitle
    sl.addText(
      "Yapay Zeka Kişiselleştirilmiş Gerçek Zamanlı\nEgzersiz Form Analiz Sistemi",
      { x: 0.8, y: 3.75, w: 12, h: 1.3, fontSize: 28, color: C.offwhite,
        fontFace: "Calibri", margin: 0 }
    );

    // Tagline
    sl.addText("Kişisel · Yerel · Gerçek Zamanlı", {
      x: 0.8, y: 5.1, w: 12, h: 0.5, fontSize: 18, italic: true, color: C.mint,
      fontFace: "Calibri", margin: 0,
    });

    // Footer row with pills
    const pills = ["Sağlık", "Sağlıklı Yaşam & Spor", "KVKK Uyumlu"];
    let px = 0.8;
    for (const p of pills) {
      const w = 0.22 * p.length + 0.6;
      sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: px, y: 6.4, w, h: 0.45, fill: { color: C.navySoft }, line: { color: C.cyan, width: 1 },
        rectRadius: 0.22,
      });
      sl.addText(p, {
        x: px, y: 6.4, w, h: 0.45, fontSize: 12, color: C.offwhite, fontFace: "Calibri",
        align: "center", valign: "middle", margin: 0,
      });
      px += w + 0.2;
    }
  }

  // ----- SLIDE 2: PROBLEM --------------------------------------------------
  {
    const sl = pres.addSlide();
    sl.background = { color: C.offwhite };
    addHeader(sl, "Küresel Bir Sağlık Problemi", "PROBLEM");

    // 4 big stat cards
    const stats = [
      { n: "564.845", label: "ABD'de yıllık egzersiz yaralanması (2024)", color: C.coral, ic: FA.FaExclamationTriangle },
      { n: "%20", label: "Hatalı formdan kaynaklanan yaralanma oranı", color: C.amber, ic: FA.FaRunning },
      { n: "%70", label: "Spor salonu yaralanmaları: <1 yıl deneyimliler", color: C.cyan, ic: FA.FaUserClock },
      { n: "$300 Milyar", label: "2020–2030 tahmini sağlık maliyeti (WHO)", color: C.mintDark, ic: FA.FaDollarSign },
    ];
    const cardW = 2.8, cardH = 2.6, gap = 0.25;
    const totalW = cardW * 4 + gap * 3;
    const startX = (SW - totalW) / 2;
    for (let i = 0; i < stats.length; i++) {
      const x = startX + i * (cardW + gap);
      const y = 1.95;
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: cardH, fill: { color: C.paper }, line: { color: C.slate200, width: 1 },
        shadow: s(),
      });
      // Top accent
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: 0.12, fill: { color: stats[i].color }, line: { color: stats[i].color },
      });
      // Icon circle
      sl.addShape(pres.shapes.OVAL, {
        x: x + cardW / 2 - 0.35, y: y + 0.38, w: 0.7, h: 0.7,
        fill: { color: stats[i].color, transparency: 85 }, line: { color: stats[i].color, width: 1 },
      });
      const ic = await icon(stats[i].ic, stats[i].color, 256);
      sl.addImage({ data: ic, x: x + cardW / 2 - 0.22, y: y + 0.51, w: 0.44, h: 0.44 });
      // Big number
      sl.addText(stats[i].n, {
        x, y: y + 1.2, w: cardW, h: 0.7, fontSize: 28, bold: true,
        color: C.slate900, align: "center", fontFace: "Calibri", margin: 0,
      });
      // Label
      sl.addText(stats[i].label, {
        x: x + 0.2, y: y + 1.85, w: cardW - 0.4, h: 0.7, fontSize: 11,
        color: C.slate700, align: "center", fontFace: "Calibri", margin: 0,
      });
    }

    // Bottom insight strip
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 5.1, w: SW - 1.2, h: 1.4, fill: { color: C.navy }, line: { color: C.navy },
    });
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 5.1, w: 0.12, h: 1.4, fill: { color: C.mint }, line: { color: C.mint },
    });
    sl.addText("Küresel fiziksel hareketsizlik: %23,4 (2000) → %31,3 (2022)", {
      x: 1.0, y: 5.2, w: SW - 1.8, h: 0.45, fontSize: 18, bold: true,
      color: C.offwhite, fontFace: "Calibri", margin: 0,
    });
    sl.addText(
      "Mevcut uygulamalar tek tip kurallar uyguluyor; bel fıtığı, menisküs veya omuz sıkışması gibi bireysel sağlık durumlarını yok sayıyor — bu da kronik rahatsızlığı olan bireyler için ciddi sakatlık riski doğuruyor.",
      { x: 1.0, y: 5.7, w: SW - 1.8, h: 0.85, fontSize: 12, color: C.slate200,
        fontFace: "Calibri", margin: 0 }
    );

    addFooter(sl, 2, TOTAL);
  }

  // ----- SLIDE 3: SOLUTION (3-layer) --------------------------------------
  {
    const sl = pres.addSlide();
    sl.background = { color: C.offwhite };
    addHeader(sl, "Çözüm: Üç Katmanlı Yaklaşım", "ÇÖZÜM — FITGUARD AI");

    const layers = [
      {
        t: "Tıbbi Yapay Zeka",
        sub: "MedGemma Katmanı",
        d: "Kullanıcının fiziksel şikayetine göre tıbbi literatüre dayalı güvenli eklem açı sınırlarını belirler.",
        ic: FA.FaStethoscope, color: C.cyan,
      },
      {
        t: "Bireysel Kalibrasyon",
        sub: "3 Tekrar ROM Ölçümü",
        d: "Ağırlıksız 3 tekrarla kullanıcının anlık esneklik ve hareket kapasitesi ölçülür.",
        ic: FA.FaUserCheck, color: C.mint,
      },
      {
        t: "Hibrit Eşik",
        sub: "Tıbbi + Kişisel Sentez",
        d: "İki veriyi birleştirerek her bireye özel dinamik bir \"güvenli hareket koridoru\" oluşturur.",
        ic: FA.FaShieldAlt, color: C.amber,
      },
    ];

    const cardW = 3.9, cardH = 4.4, gap = 0.35;
    const totalW = cardW * 3 + gap * 2;
    const startX = (SW - totalW) / 2;
    for (let i = 0; i < layers.length; i++) {
      const L = layers[i];
      const x = startX + i * (cardW + gap);
      const y = 2.0;
      // Card
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: cardH, fill: { color: C.paper }, line: { color: C.slate200, width: 1 },
        shadow: s(),
      });
      // Left accent
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 0.15, h: cardH, fill: { color: L.color }, line: { color: L.color },
      });
      // Number badge
      sl.addShape(pres.shapes.OVAL, {
        x: x + cardW - 0.85, y: y + 0.3, w: 0.6, h: 0.6,
        fill: { color: L.color, transparency: 80 }, line: { color: L.color, width: 1 },
      });
      sl.addText(String(i + 1), {
        x: x + cardW - 0.85, y: y + 0.3, w: 0.6, h: 0.6, fontSize: 24, bold: true,
        color: L.color, align: "center", valign: "middle", fontFace: "Calibri", margin: 0,
      });
      // Icon
      const ic = await icon(L.ic, L.color, 256);
      sl.addImage({ data: ic, x: x + 0.45, y: y + 0.5, w: 0.9, h: 0.9 });
      // Title
      sl.addText(L.t, {
        x: x + 0.4, y: y + 1.55, w: cardW - 0.6, h: 0.55, fontSize: 22, bold: true,
        color: C.slate900, fontFace: "Calibri", margin: 0,
      });
      // Subtitle
      sl.addText(L.sub, {
        x: x + 0.4, y: y + 2.1, w: cardW - 0.6, h: 0.4, fontSize: 13, color: L.color, bold: true,
        fontFace: "Calibri", margin: 0,
      });
      // Description
      sl.addText(L.d, {
        x: x + 0.4, y: y + 2.6, w: cardW - 0.6, h: 1.6, fontSize: 13,
        color: C.slate700, fontFace: "Calibri", margin: 0,
      });
    }

    // Arrows between cards
    for (let i = 0; i < 2; i++) {
      const ax = startX + (i + 1) * cardW + i * gap + 0.05;
      sl.addText("→", {
        x: ax, y: 3.8, w: gap - 0.1, h: 0.6, fontSize: 28, bold: true,
        color: C.slate500, align: "center", valign: "middle", fontFace: "Calibri", margin: 0,
      });
    }

    addFooter(sl, 3, TOTAL);
  }

  // ----- SLIDE 4: SYSTEM ARCHITECTURE -------------------------------------
  {
    const sl = pres.addSlide();
    sl.background = { color: C.offwhite };
    addHeader(sl, "Sistem Mimarisi", "TEKNOLOJİ YIĞINI");

    // Three stack columns: Frontend, Backend, AI
    const cols = [
      {
        t: "Frontend",
        ic: FA.FaDesktop, color: C.cyan,
        items: ["Next.js 14 + React 18", "TypeScript + Tailwind CSS",
                "MediaPipe BlazePose", "react-webcam", "Zustand store", "Web Speech API (TTS)"],
      },
      {
        t: "Backend",
        ic: FA.FaServer, color: C.mint,
        items: ["Python 3.10+", "FastAPI + WebSocket", "NumPy (açı hesabı)",
                "SQLite (lokal DB)", "Pydantic v2", "20+ FPS analiz"],
      },
      {
        t: "Yapay Zeka",
        ic: FA.FaBrain, color: C.amber,
        items: ["Google MedGemma-4B-IT", "Hugging Face Transformers",
                "bitsandbytes (4-bit)", "accelerate + CUDA", "~5 GB GPU RAM", "Tüketici GPU (RTX 4060)"],
      },
    ];

    const cardW = 3.9, cardH = 4.5, gap = 0.3;
    const totalW = cardW * 3 + gap * 2;
    const startX = (SW - totalW) / 2;
    for (let i = 0; i < cols.length; i++) {
      const col = cols[i];
      const x = startX + i * (cardW + gap);
      const y = 2.0;
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: cardH, fill: { color: C.paper }, line: { color: C.slate200, width: 1 },
        shadow: s(),
      });
      // Header bar
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: 0.9, fill: { color: col.color }, line: { color: col.color },
      });
      // Icon
      const ic = await icon(col.ic, C.paper, 256);
      sl.addImage({ data: ic, x: x + 0.3, y: y + 0.2, w: 0.5, h: 0.5 });
      // Title
      sl.addText(col.t, {
        x: x + 0.95, y: y + 0.2, w: cardW - 1.1, h: 0.5, fontSize: 22, bold: true,
        color: C.paper, fontFace: "Calibri", valign: "middle", margin: 0,
      });
      // Items
      const lines = col.items.map((it, idx) => ({
        text: it,
        options: { bullet: true, breakLine: idx < col.items.length - 1 },
      }));
      sl.addText(lines, {
        x: x + 0.35, y: y + 1.1, w: cardW - 0.6, h: cardH - 1.3,
        fontSize: 13, color: C.slate700, fontFace: "Calibri", paraSpaceAfter: 6, margin: 0,
      });
    }

    // Bottom data-flow strip
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 6.7, w: SW - 1.2, h: 0.5, fill: { color: C.navy }, line: { color: C.navy },
    });
    sl.addText("Kamera → MediaPipe → WebSocket (20+ FPS) → Açı Hesabı → Hibrit Eşik → Uyarı", {
      x: 0.6, y: 6.7, w: SW - 1.2, h: 0.5, fontSize: 13, color: C.offwhite, bold: true,
      align: "center", valign: "middle", fontFace: "Consolas", margin: 0,
    });

    addFooter(sl, 4, TOTAL);
  }

  // ----- SLIDE 5: USER FLOW / LANDING ------------------------------------
  {
    const sl = pres.addSlide();
    sl.background = { color: C.offwhite };
    addHeader(sl, "Kullanıcı Akışı: Giriş Ekranı", "KULLANIM");

    // Left: flow steps
    const steps = [
      { t: "1. Egzersiz Seç", d: "Squat · Deadlift · Biceps Curl · Shoulder Press · Lateral Raise", ic: FA.FaDumbbell, color: C.cyan },
      { t: "2. Şikayet (Opsiyonel)", d: "Örn: \"bel fıtığım var\" · Boş bırakılırsa MedGemma atlanır", ic: FA.FaNotesMedical, color: C.mint },
      { t: "3. MedGemma Analizi", d: "Tıbbi sınırlar JSON olarak döner (veya fast-path)", ic: FA.FaBrain, color: C.amber },
      { t: "4. Kalibrasyona Geç", d: "Kişisel ROM ölçümü başlar", ic: FA.FaArrowRight, color: C.coral },
    ];
    for (let i = 0; i < steps.length; i++) {
      const S = steps[i];
      const y = 2.0 + i * 1.05;
      const x = 0.8;
      // Card
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 6.3, h: 0.9, fill: { color: C.paper }, line: { color: C.slate200, width: 1 },
      });
      // Left accent
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 0.1, h: 0.9, fill: { color: S.color }, line: { color: S.color },
      });
      // Icon circle
      sl.addShape(pres.shapes.OVAL, {
        x: x + 0.3, y: y + 0.15, w: 0.6, h: 0.6,
        fill: { color: S.color, transparency: 82 }, line: { color: S.color, width: 1 },
      });
      const ic = await icon(S.ic, S.color, 256);
      sl.addImage({ data: ic, x: x + 0.4, y: y + 0.25, w: 0.4, h: 0.4 });
      // Texts
      sl.addText(S.t, {
        x: x + 1.05, y: y + 0.1, w: 5.0, h: 0.4, fontSize: 16, bold: true,
        color: C.slate900, fontFace: "Calibri", margin: 0,
      });
      sl.addText(S.d, {
        x: x + 1.05, y: y + 0.48, w: 5.1, h: 0.42, fontSize: 11,
        color: C.slate700, fontFace: "Calibri", margin: 0,
      });
    }

    // Right: visual panel — a stylized phone/app mockup
    const mx = 8.0, my = 1.9, mw = 4.5, mh = 4.5;
    sl.addShape(pres.shapes.RECTANGLE, {
      x: mx, y: my, w: mw, h: mh, fill: { color: C.navy }, line: { color: C.navy }, shadow: s(),
    });
    sl.addShape(pres.shapes.RECTANGLE, {
      x: mx, y: my, w: mw, h: 0.5, fill: { color: C.navyDeep }, line: { color: C.navyDeep },
    });
    sl.addText("FitGuard AI  —  Giriş", {
      x: mx + 0.3, y: my + 0.05, w: mw - 0.6, h: 0.4, fontSize: 13, bold: true,
      color: C.mint, fontFace: "Calibri", valign: "middle", margin: 0,
    });

    // Exercise tiles (2x3 mock)
    const tiles = ["Squat", "Deadlift", "Biceps", "Shoulder", "Lateral", "+ Ekle"];
    const tw = (mw - 0.6 - 0.3) / 3, th = 0.85;
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const tx = mx + 0.3 + col * (tw + 0.15);
      const ty = my + 0.7 + row * (th + 0.15);
      sl.addShape(pres.shapes.RECTANGLE, {
        x: tx, y: ty, w: tw, h: th,
        fill: { color: i === 0 ? C.mint : C.navySoft }, line: { color: i === 0 ? C.mint : C.cyan, width: 1 },
      });
      sl.addText(tiles[i], {
        x: tx, y: ty, w: tw, h: th, fontSize: 11, bold: true,
        color: i === 0 ? C.navy : C.offwhite, align: "center", valign: "middle",
        fontFace: "Calibri", margin: 0,
      });
    }

    // Condition input mock
    sl.addShape(pres.shapes.RECTANGLE, {
      x: mx + 0.3, y: my + 2.7, w: mw - 0.6, h: 0.55,
      fill: { color: C.navyDeep }, line: { color: C.cyan, width: 1 },
    });
    sl.addText("Şikayetiniz (ops.)", {
      x: mx + 0.45, y: my + 2.7, w: mw - 0.8, h: 0.55, fontSize: 11,
      color: C.slate500, italic: true, fontFace: "Calibri", valign: "middle", margin: 0,
    });

    // Action button
    sl.addShape(pres.shapes.RECTANGLE, {
      x: mx + 0.3, y: my + 3.45, w: mw - 0.6, h: 0.55,
      fill: { color: C.mint }, line: { color: C.mint },
    });
    sl.addText("MedGemma ile başla →", {
      x: mx + 0.3, y: my + 3.45, w: mw - 0.6, h: 0.55, fontSize: 13, bold: true,
      color: C.navy, align: "center", valign: "middle", fontFace: "Calibri", margin: 0,
    });

    addFooter(sl, 5, TOTAL);
  }

  // ----- SLIDE 6: MEDGEMMA -----------------------------------------------
  {
    const sl = pres.addSlide();
    sl.background = { color: C.offwhite };
    addHeader(sl, "MedGemma Entegrasyonu", "TIBBİ YAPAY ZEKA");

    // Left: description
    const descY = 2.0;
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: descY, w: 5.6, h: 4.5, fill: { color: C.paper },
      line: { color: C.slate200, width: 1 }, shadow: s(),
    });
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: descY, w: 0.12, h: 4.5, fill: { color: C.cyan }, line: { color: C.cyan },
    });

    const icBrain = await icon(FA.FaBrain, C.cyan, 256);
    sl.addImage({ data: icBrain, x: 0.95, y: descY + 0.3, w: 0.7, h: 0.7 });
    sl.addText("Google MedGemma-4B-IT", {
      x: 1.8, y: descY + 0.3, w: 4.2, h: 0.5, fontSize: 20, bold: true,
      color: C.slate900, fontFace: "Calibri", valign: "middle", margin: 0,
    });
    sl.addText("Sağlığa özelleştirilmiş büyük dil modeli", {
      x: 1.8, y: descY + 0.75, w: 4.2, h: 0.35, fontSize: 12,
      color: C.slate500, italic: true, fontFace: "Calibri", valign: "middle", margin: 0,
    });

    const feats = [
      "4-bit nicemleme · ~5 GB GPU RAM",
      "Girdi: şikayet + egzersiz + hedef eklemler",
      "Çıktı: yapılandırılmış JSON yanıt",
      "Biyomekanik doğrulama katmanı",
      "Referansdan %50+ sapan değerler düzeltilir",
      "Fast-path: şikayet yoksa atlanır",
    ];
    sl.addText(
      feats.map((f, i) => ({
        text: f,
        options: { bullet: true, breakLine: i < feats.length - 1, color: C.slate700 },
      })),
      { x: 1.0, y: descY + 1.3, w: 5.1, h: 3.1, fontSize: 13,
        color: C.slate700, fontFace: "Calibri", paraSpaceAfter: 8, margin: 0 }
    );

    // Right: JSON example card
    const jx = 6.6, jy = descY, jw = 6.1, jh = 4.5;
    sl.addShape(pres.shapes.RECTANGLE, {
      x: jx, y: jy, w: jw, h: jh, fill: { color: C.navy }, line: { color: C.navy }, shadow: s(),
    });
    sl.addShape(pres.shapes.RECTANGLE, {
      x: jx, y: jy, w: jw, h: 0.5, fill: { color: C.navyDeep }, line: { color: C.navyDeep },
    });
    // Traffic lights
    ["E76F51", "F4A261", "2A9D8F"].forEach((c, i) => {
      sl.addShape(pres.shapes.OVAL, {
        x: jx + 0.2 + i * 0.25, y: jy + 0.17, w: 0.16, h: 0.16,
        fill: { color: c }, line: { color: c },
      });
    });
    sl.addText("medgemma_response.json", {
      x: jx + 1.2, y: jy + 0.05, w: jw - 1.5, h: 0.4, fontSize: 11,
      color: C.slate500, italic: true, fontFace: "Consolas", valign: "middle", margin: 0,
    });

    const jsonLines = [
      { text: "{", color: C.offwhite },
      { text: '  "target_joint": ', color: C.mint, more: '"left_knee",', moreColor: C.amber },
      { text: '  "max_safe_angle": ', color: C.mint, more: "110,", moreColor: C.cyan },
      { text: '  "min_safe_angle": ', color: C.mint, more: "80,", moreColor: C.cyan },
      { text: '  "warning": ', color: C.mint, more: '"Menisküste basınç...",', moreColor: C.amber },
      { text: '  "alternatives": ', color: C.mint, more: '["box squat"],', moreColor: C.amber },
      { text: '  "confidence": ', color: C.mint, more: "0.87", moreColor: C.cyan },
      { text: "}", color: C.offwhite },
    ];
    for (let i = 0; i < jsonLines.length; i++) {
      const L = jsonLines[i];
      const y = jy + 0.75 + i * 0.42;
      sl.addText(L.text, {
        x: jx + 0.3, y, w: 3.0, h: 0.4, fontSize: 14, fontFace: "Consolas",
        color: L.color, margin: 0,
      });
      if (L.more) {
        sl.addText(L.more, {
          x: jx + 2.6, y, w: 3.3, h: 0.4, fontSize: 14, fontFace: "Consolas",
          color: L.moreColor, margin: 0,
        });
      }
    }

    addFooter(sl, 6, TOTAL);
  }

  // ----- SLIDE 7: CALIBRATION ---------------------------------------------
  {
    const sl = pres.addSlide();
    sl.background = { color: C.offwhite };
    addHeader(sl, "Kalibrasyon: 3 Tekrarda Kişisel ROM", "BİREYSEL KALİBRASYON");

    // Left: a mock angle-over-time plot with 3 peaks
    const px = 0.6, py = 2.0, pw = 7.5, ph = 4.5;
    sl.addShape(pres.shapes.RECTANGLE, {
      x: px, y: py, w: pw, h: ph, fill: { color: C.paper },
      line: { color: C.slate200, width: 1 }, shadow: s(),
    });
    sl.addText("Tekrar Tespiti: Peak / Valley Algoritması", {
      x: px + 0.3, y: py + 0.2, w: pw - 0.6, h: 0.4, fontSize: 15, bold: true,
      color: C.slate900, fontFace: "Calibri", margin: 0,
    });
    sl.addText("sol_diz açısı — zaman serisi", {
      x: px + 0.3, y: py + 0.6, w: pw - 0.6, h: 0.3, fontSize: 11,
      color: C.slate500, italic: true, fontFace: "Calibri", margin: 0,
    });

    // Plot area bounds
    const ax = px + 0.6, ay = py + 1.15, aw = pw - 0.9, ah = 2.8;
    // y grid lines (3)
    for (let i = 0; i <= 3; i++) {
      const y = ay + (ah / 3) * i;
      sl.addShape(pres.shapes.LINE, {
        x: ax, y, w: aw, h: 0.01, line: { color: C.slate200, width: 0.75 },
      });
    }
    // axis
    sl.addShape(pres.shapes.LINE, {
      x: ax, y: ay + ah, w: aw, h: 0.01, line: { color: C.slate500, width: 1 },
    });
    sl.addShape(pres.shapes.LINE, {
      x: ax, y: ay, w: 0.01, h: ah, line: { color: C.slate500, width: 1 },
    });

    // Draw 3 rep peaks as a zig-zag of lines (peaks=top=small angle for squat; valleys=bottom=large)
    const points = [
      [0.00, 0.10], [0.06, 0.12], [0.10, 0.80], [0.14, 0.85], [0.20, 0.15],
      [0.26, 0.18], [0.34, 0.90], [0.40, 0.92], [0.46, 0.20], [0.52, 0.22],
      [0.60, 0.82], [0.66, 0.86], [0.72, 0.18], [0.82, 0.15], [1.00, 0.14],
    ];
    for (let i = 0; i < points.length - 1; i++) {
      const [fx1, fy1] = points[i], [fx2, fy2] = points[i + 1];
      const x1 = ax + fx1 * aw, y1 = ay + fy1 * ah;
      const x2 = ax + fx2 * aw, y2 = ay + fy2 * ah;
      const mnx = Math.min(x1, x2), mny = Math.min(y1, y2);
      const ww = Math.max(0.01, Math.abs(x2 - x1));
      const hh = Math.max(0.01, Math.abs(y2 - y1));
      const flipV = (x1 < x2 && y1 > y2) || (x1 > x2 && y1 < y2);
      sl.addShape(pres.shapes.LINE, {
        x: mnx, y: mny, w: ww, h: hh, flipV,
        line: { color: C.mint, width: 2.5 },
      });
    }
    // Peak markers (3 peaks = valleys in flex)
    const peakIdxs = [3, 7, 11];
    for (const pi of peakIdxs) {
      const [fx, fy] = points[pi];
      sl.addShape(pres.shapes.OVAL, {
        x: ax + fx * aw - 0.09, y: ay + fy * ah - 0.09, w: 0.18, h: 0.18,
        fill: { color: C.coral }, line: { color: C.paper, width: 1.5 },
      });
    }
    // Valley markers
    const valIdxs = [4, 8, 12];
    for (const vi of valIdxs) {
      const [fx, fy] = points[vi];
      sl.addShape(pres.shapes.OVAL, {
        x: ax + fx * aw - 0.09, y: ay + fy * ah - 0.09, w: 0.18, h: 0.18,
        fill: { color: C.cyan }, line: { color: C.paper, width: 1.5 },
      });
    }

    // Legend
    sl.addShape(pres.shapes.OVAL, {
      x: px + 0.6, y: py + 4.2, w: 0.2, h: 0.2, fill: { color: C.coral }, line: { color: C.coral },
    });
    sl.addText("Peak (valley)", {
      x: px + 0.85, y: py + 4.15, w: 1.8, h: 0.3, fontSize: 11,
      color: C.slate700, fontFace: "Calibri", valign: "middle", margin: 0,
    });
    sl.addShape(pres.shapes.OVAL, {
      x: px + 2.7, y: py + 4.2, w: 0.2, h: 0.2, fill: { color: C.cyan }, line: { color: C.cyan },
    });
    sl.addText("Valley (top)", {
      x: px + 2.95, y: py + 4.15, w: 1.8, h: 0.3, fontSize: 11,
      color: C.slate700, fontFace: "Calibri", valign: "middle", margin: 0,
    });
    sl.addText("3 tekrar yakalandı ✓", {
      x: px + 5.2, y: py + 4.15, w: 2.1, h: 0.3, fontSize: 12, bold: true,
      color: C.mint, fontFace: "Calibri", align: "right", valign: "middle", margin: 0,
    });

    // Right side: parameters + steps
    const rx = 8.4, rw = 4.3;
    const params = [
      { k: "33", v: "MediaPipe landmark noktası" },
      { k: "20°", v: "Minimum peak-valley genliği" },
      { k: "4°", v: "Histerezis (jitter filtresi)" },
      { k: "3x", v: "Kalibrasyon tekrar sayısı" },
    ];
    for (let i = 0; i < params.length; i++) {
      const y = 2.0 + i * 1.18;
      sl.addShape(pres.shapes.RECTANGLE, {
        x: rx, y, w: rw, h: 1.0, fill: { color: C.paper }, line: { color: C.slate200, width: 1 },
      });
      sl.addShape(pres.shapes.RECTANGLE, {
        x: rx, y, w: 0.1, h: 1.0, fill: { color: C.mint }, line: { color: C.mint },
      });
      sl.addText(params[i].k, {
        x: rx + 0.25, y: y + 0.1, w: 1.4, h: 0.8, fontSize: 26, bold: true,
        color: C.mint, fontFace: "Calibri", valign: "middle", margin: 0,
      });
      sl.addText(params[i].v, {
        x: rx + 1.55, y: y + 0.1, w: rw - 1.7, h: 0.8, fontSize: 12,
        color: C.slate700, fontFace: "Calibri", valign: "middle", margin: 0,
      });
    }

    addFooter(sl, 7, TOTAL);
  }

  // ----- SLIDE 8: HYBRID THRESHOLD (most original) ------------------------
  {
    const sl = pres.addSlide();
    sl.background = { color: C.navy };

    // Dark-slide header
    sl.addText("PROJENİN EN ÖZGÜN KISMI", {
      x: 0.8, y: 0.5, w: 12, h: 0.3, fontSize: 12, bold: true,
      color: C.mint, charSpacing: 4, fontFace: "Calibri", margin: 0,
    });
    sl.addText("Hibrit Eşik Algoritması", {
      x: 0.8, y: 0.85, w: 12, h: 0.8, fontSize: 36, bold: true,
      color: C.offwhite, fontFace: "Calibri", margin: 0,
    });
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.65, w: 0.8, h: 0.07, fill: { color: C.mint }, line: { color: C.mint },
    });

    // Tagline
    sl.addText("Tıbbi güvenlik + bireysel kapasite → kişiye özel güvenli koridor", {
      x: 0.8, y: 1.85, w: 12, h: 0.4, fontSize: 16, italic: true,
      color: C.slate200, fontFace: "Calibri", margin: 0,
    });

    // Two formula cards
    const fCards = [
      {
        t: "Şikayet VARSA",
        color: C.cyan,
        lines: [
          "hibrit_max = min( llm_max , kalibre_max × 1.10 )",
          "hibrit_min = max( llm_min , kalibre_min × 0.90 )",
        ],
        note: "Tıbbi sınırı asla aşmaz, kişisel kapasitenin de üstüne çıkmaz.",
      },
      {
        t: "Şikayet YOKSA",
        color: C.mint,
        lines: [
          "hibrit_max = kalibre_max × 1.10",
          "hibrit_min = kalibre_min × 0.90",
        ],
        note: "MedGemma atlanır; yalnızca kişisel ROM + %10 tolerans.",
      },
    ];
    for (let i = 0; i < fCards.length; i++) {
      const F = fCards[i];
      const x = 0.8 + i * 6.25, y = 2.65, w = 5.7, h = 2.5;
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h, fill: { color: C.navySoft }, line: { color: F.color, width: 2 },
      });
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h: 0.12, fill: { color: F.color }, line: { color: F.color },
      });
      sl.addText(F.t, {
        x: x + 0.3, y: y + 0.25, w: w - 0.6, h: 0.45, fontSize: 18, bold: true,
        color: F.color, charSpacing: 2, fontFace: "Calibri", margin: 0,
      });
      sl.addText(F.lines.join("\n"), {
        x: x + 0.3, y: y + 0.9, w: w - 0.6, h: 0.95, fontSize: 13,
        color: C.offwhite, fontFace: "Consolas", margin: 0,
      });
      sl.addText(F.note, {
        x: x + 0.3, y: y + 1.9, w: w - 0.6, h: 0.5, fontSize: 11, italic: true,
        color: C.slate200, fontFace: "Calibri", margin: 0,
      });
    }

    // Tolerance strip
    const ty = 5.5;
    sl.addText("3 Katmanlı Tolerans Sistemi", {
      x: 0.8, y: ty, w: 12, h: 0.4, fontSize: 16, bold: true,
      color: C.offwhite, fontFace: "Calibri", margin: 0,
    });
    const tol = [
      { t: "< 8°", s: "Güvenli", d: "uyarı yok", color: C.mint },
      { t: "8°–20°", s: "Uyarı", d: "sarı renk, görsel", color: C.amber },
      { t: "≥ 20°", s: "Tehlike", d: "kırmızı + sesli TTS", color: C.coral },
    ];
    for (let i = 0; i < tol.length; i++) {
      const T = tol[i], x = 0.8 + i * 4.2, y = ty + 0.55, w = 3.9, h = 1.15;
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h, fill: { color: C.navyDeep }, line: { color: T.color, width: 1.5 },
      });
      sl.addShape(pres.shapes.OVAL, {
        x: x + 0.2, y: y + 0.25, w: 0.65, h: 0.65,
        fill: { color: T.color }, line: { color: T.color },
      });
      sl.addText(T.t, {
        x: x + 0.2, y: y + 0.25, w: 0.65, h: 0.65, fontSize: 11, bold: true,
        color: C.navy, align: "center", valign: "middle", fontFace: "Calibri", margin: 0,
      });
      sl.addText(T.s, {
        x: x + 1.0, y: y + 0.15, w: w - 1.1, h: 0.45, fontSize: 16, bold: true,
        color: T.color, fontFace: "Calibri", valign: "middle", margin: 0,
      });
      sl.addText(T.d, {
        x: x + 1.0, y: y + 0.58, w: w - 1.1, h: 0.45, fontSize: 11,
        color: C.slate200, fontFace: "Calibri", margin: 0,
      });
    }

    // Dark-slide footer (light text)
    sl.addText("FitGuard AI  ·  TEKNOFEST Araştırma Projesi", {
      x: 0.8, y: SH - 0.4, w: 8, h: 0.3, fontSize: 9, color: C.slate500,
      fontFace: "Calibri", margin: 0,
    });
    sl.addText("8 / 14", {
      x: SW - 1.2, y: SH - 0.4, w: 0.6, h: 0.3, fontSize: 9, color: C.slate500,
      fontFace: "Calibri", align: "right", margin: 0,
    });
  }

  // ----- SLIDE 9: ANGLE MATH ---------------------------------------------
  {
    const sl = pres.addSlide();
    sl.background = { color: C.offwhite };
    addHeader(sl, "Açı Hesaplama: Vektörel İç Çarpım", "MATEMATİKSEL TEMEL");

    // Left: geometry illustration
    const gx = 0.8, gy = 2.0, gw = 5.6, gh = 4.5;
    sl.addShape(pres.shapes.RECTANGLE, {
      x: gx, y: gy, w: gw, h: gh, fill: { color: C.paper },
      line: { color: C.slate200, width: 1 }, shadow: s(),
    });
    sl.addText("Geometrik Model (3 landmark)", {
      x: gx + 0.3, y: gy + 0.2, w: gw - 0.6, h: 0.35, fontSize: 14, bold: true,
      color: C.slate900, fontFace: "Calibri", margin: 0,
    });

    // Draw points A, B (vertex), C with connecting lines
    const bx = gx + 2.8, by = gy + 3.1; // vertex
    const ax = gx + 1.1, ay = gy + 1.4;
    const cx = gx + 5.0, cy = gy + 2.0;
    // Lines BA, BC — plain lines without arrows for PowerPoint compat
    // BA: B(bx,by) → A(ax,ay). ax<bx, ay<by. Default LINE (top-left → bot-right) works.
    sl.addShape(pres.shapes.LINE, {
      x: ax, y: ay, w: bx - ax, h: by - ay,
      line: { color: C.cyan, width: 4 },
    });
    // BC: B(bx,by) → C(cx,cy). cx>bx, cy<by. Need flipV.
    sl.addShape(pres.shapes.LINE, {
      x: bx, y: cy, w: cx - bx, h: by - cy,
      line: { color: C.mint, width: 4 }, flipV: true,
    });

    // Angle indicator at B — small filled oval instead of ARC (better PowerPoint compat)
    sl.addShape(pres.shapes.OVAL, {
      x: bx - 0.22, y: by - 0.22, w: 0.44, h: 0.44,
      fill: { color: C.coral, transparency: 65 }, line: { color: C.coral, width: 2 },
    });

    // Point markers
    const pts = [
      { x: ax, y: ay, l: "A (omuz)", c: C.cyan },
      { x: bx, y: by, l: "B (dirsek / vertex)", c: C.coral },
      { x: cx, y: cy, l: "C (bilek)", c: C.mint },
    ];
    for (const p of pts) {
      sl.addShape(pres.shapes.OVAL, {
        x: p.x - 0.14, y: p.y - 0.14, w: 0.28, h: 0.28,
        fill: { color: p.c }, line: { color: C.paper, width: 2 },
      });
    }
    // Labels
    sl.addText("A", { x: ax - 0.5, y: ay - 0.5, w: 0.4, h: 0.3, fontSize: 13, bold: true,
      color: C.cyan, fontFace: "Calibri", align: "right", margin: 0 });
    sl.addText("B (vertex)", { x: bx - 1.2, y: by + 0.15, w: 1.3, h: 0.3, fontSize: 13, bold: true,
      color: C.coral, fontFace: "Calibri", align: "right", margin: 0 });
    sl.addText("C", { x: cx + 0.15, y: cy - 0.2, w: 0.4, h: 0.3, fontSize: 13, bold: true,
      color: C.mint, fontFace: "Calibri", margin: 0 });

    // Angle label
    sl.addText("α = 103°", {
      x: bx - 1.2, y: by - 0.9, w: 1.4, h: 0.4, fontSize: 16, bold: true,
      color: C.coral, fontFace: "Calibri", align: "center", margin: 0,
    });

    // Right: formulas
    const rx = 6.8, rw = 5.9;
    sl.addShape(pres.shapes.RECTANGLE, {
      x: rx, y: 2.0, w: rw, h: 4.5, fill: { color: C.navy },
      line: { color: C.navy }, shadow: s(),
    });

    const formulaBlocks = [
      { h: "1. Vektörleri oluştur", body: "BA = A − B\nBC = C − B" },
      { h: "2. Kosinüs teoremi (iç çarpım)", body: "cos(α) = (BA · BC) / (|BA| × |BC|)" },
      { h: "3. Dereceye çevir", body: "α = arccos(cos(α)) × (180 / π)" },
    ];
    for (let i = 0; i < formulaBlocks.length; i++) {
      const fb = formulaBlocks[i];
      const y = 2.25 + i * 1.4;
      sl.addText(fb.h, {
        x: rx + 0.4, y, w: rw - 0.8, h: 0.4, fontSize: 14, bold: true,
        color: C.mint, fontFace: "Calibri", margin: 0,
      });
      sl.addShape(pres.shapes.RECTANGLE, {
        x: rx + 0.4, y: y + 0.45, w: rw - 0.8, h: 0.75,
        fill: { color: C.navyDeep }, line: { color: C.navySoft, width: 1 },
      });
      sl.addText(fb.body, {
        x: rx + 0.55, y: y + 0.45, w: rw - 1.1, h: 0.75, fontSize: 14,
        color: C.offwhite, fontFace: "Consolas", valign: "middle", margin: 0,
      });
    }

    addFooter(sl, 9, TOTAL);
  }

  // ----- SLIDE 10: LIVE TRAINING -----------------------------------------
  {
    const sl = pres.addSlide();
    sl.background = { color: C.offwhite };
    addHeader(sl, "Gerçek Zamanlı Antrenman", "CANLI SEANS");

    // Left: mock video panel
    const vx = 0.6, vy = 2.0, vw = 7.0, vh = 4.6;
    sl.addShape(pres.shapes.RECTANGLE, {
      x: vx, y: vy, w: vw, h: vh, fill: { color: C.navyDeep },
      line: { color: C.navy }, shadow: s(),
    });
    // Fake silhouette
    sl.addShape(pres.shapes.OVAL, {
      x: vx + vw / 2 - 0.35, y: vy + 0.8, w: 0.7, h: 0.7,
      fill: { color: C.navySoft }, line: { color: C.cyan, width: 2 },
    });
    // body stick
    const cx = vx + vw / 2;
    const drawLine = (x1, y1, x2, y2, color, w = 3) => {
      const dx = x2 - x1, dy = y2 - y1;
      const minX = Math.min(x1, x2), minY = Math.min(y1, y2);
      const absW = Math.max(0.01, Math.abs(dx));
      const absH = Math.max(0.01, Math.abs(dy));
      // Line direction: flipV needed when dx and dy have opposite signs
      const flipV = (dx > 0 && dy < 0) || (dx < 0 && dy > 0);
      sl.addShape(pres.shapes.LINE, {
        x: minX, y: minY, w: absW, h: absH,
        line: { color, width: w }, flipV,
      });
    };
    // torso
    drawLine(cx, vy + 1.5, cx, vy + 3.0, C.mint, 4);
    // left arm (green)
    drawLine(cx, vy + 1.8, cx - 1.0, vy + 2.6, C.mint);
    drawLine(cx - 1.0, vy + 2.6, cx - 0.6, vy + 3.5, C.mint);
    // right arm — warning (amber)
    drawLine(cx, vy + 1.8, cx + 1.1, vy + 2.4, C.amber);
    drawLine(cx + 1.1, vy + 2.4, cx + 1.8, vy + 3.3, C.coral);
    // legs — danger (red)
    drawLine(cx, vy + 3.0, cx - 0.7, vy + 4.0, C.coral);
    drawLine(cx - 0.7, vy + 4.0, cx - 0.5, vy + 4.5, C.coral);
    drawLine(cx, vy + 3.0, cx + 0.7, vy + 4.0, C.mint);
    drawLine(cx + 0.7, vy + 4.0, cx + 0.5, vy + 4.5, C.mint);

    // joint dots
    const joints = [
      [cx - 1.0, vy + 2.6, C.mint], [cx + 1.1, vy + 2.4, C.amber],
      [cx - 0.7, vy + 4.0, C.coral], [cx + 0.7, vy + 4.0, C.mint],
      [cx, vy + 3.0, C.coral],
    ];
    for (const [jx, jy, jc] of joints) {
      sl.addShape(pres.shapes.OVAL, {
        x: jx - 0.11, y: jy - 0.11, w: 0.22, h: 0.22,
        fill: { color: jc }, line: { color: C.paper, width: 1.5 },
      });
    }

    // angle label floating
    sl.addShape(pres.shapes.RECTANGLE, {
      x: cx - 0.5, y: vy + 3.2, w: 1.0, h: 0.35,
      fill: { color: C.coral }, line: { color: C.coral },
    });
    sl.addText("diz 48°", {
      x: cx - 0.5, y: vy + 3.2, w: 1.0, h: 0.35, fontSize: 12, bold: true,
      color: C.paper, align: "center", valign: "middle", fontFace: "Calibri", margin: 0,
    });

    // HUD overlays: rep count top-left
    sl.addShape(pres.shapes.RECTANGLE, {
      x: vx + 0.2, y: vy + 0.2, w: 1.5, h: 0.8,
      fill: { color: C.navy, transparency: 20 }, line: { color: C.mint, width: 1.5 },
    });
    sl.addText("7", {
      x: vx + 0.2, y: vy + 0.15, w: 1.5, h: 0.55, fontSize: 32, bold: true,
      color: C.mint, align: "center", valign: "middle", fontFace: "Calibri", margin: 0,
    });
    sl.addText("TEKRAR", {
      x: vx + 0.2, y: vy + 0.65, w: 1.5, h: 0.3, fontSize: 9, bold: true,
      color: C.offwhite, align: "center", valign: "middle", charSpacing: 3, fontFace: "Calibri", margin: 0,
    });

    // Form score top-right
    sl.addShape(pres.shapes.RECTANGLE, {
      x: vx + vw - 1.7, y: vy + 0.2, w: 1.5, h: 0.8,
      fill: { color: C.navy, transparency: 20 }, line: { color: C.cyan, width: 1.5 },
    });
    sl.addText("82", {
      x: vx + vw - 1.7, y: vy + 0.15, w: 1.5, h: 0.55, fontSize: 32, bold: true,
      color: C.cyan, align: "center", valign: "middle", fontFace: "Calibri", margin: 0,
    });
    sl.addText("FORM", {
      x: vx + vw - 1.7, y: vy + 0.65, w: 1.5, h: 0.3, fontSize: 9, bold: true,
      color: C.offwhite, align: "center", valign: "middle", charSpacing: 3, fontFace: "Calibri", margin: 0,
    });

    // Alert bar bottom
    sl.addShape(pres.shapes.RECTANGLE, {
      x: vx + 0.25, y: vy + vh - 0.85, w: vw - 0.5, h: 0.6,
      fill: { color: C.coral }, line: { color: C.coral },
    });
    sl.addText("⚠  Dizin çok öne kaydı — açı güvenli sınırı aştı", {
      x: vx + 0.25, y: vy + vh - 0.85, w: vw - 0.5, h: 0.6, fontSize: 13, bold: true,
      color: C.paper, align: "center", valign: "middle", fontFace: "Calibri", margin: 0,
    });

    // Right: feature list
    const rx = 7.9, rw = 4.8;
    const feats = [
      { ic: FA.FaBolt, t: "20+ FPS WebSocket", d: "Milisaniye düzeyinde gecikme", color: C.cyan },
      { ic: FA.FaEye, t: "Canlı İskelet", d: "Yeşil/sarı/kırmızı renk kodu", color: C.mint },
      { ic: FA.FaVolumeUp, t: "Türkçe Sesli Uyarı", d: "Web Speech API", color: C.amber },
      { ic: FA.FaBalanceScale, t: "Asimetri Tespiti", d: "Sağ–sol fark > 10°", color: C.coral },
    ];
    for (let i = 0; i < feats.length; i++) {
      const F = feats[i], y = 2.0 + i * 1.2;
      sl.addShape(pres.shapes.RECTANGLE, {
        x: rx, y, w: rw, h: 1.0, fill: { color: C.paper }, line: { color: C.slate200, width: 1 },
      });
      sl.addShape(pres.shapes.OVAL, {
        x: rx + 0.25, y: y + 0.2, w: 0.6, h: 0.6,
        fill: { color: F.color, transparency: 82 }, line: { color: F.color, width: 1 },
      });
      const ic = await icon(F.ic, F.color, 256);
      sl.addImage({ data: ic, x: rx + 0.35, y: y + 0.3, w: 0.4, h: 0.4 });
      sl.addText(F.t, {
        x: rx + 1.0, y: y + 0.12, w: rw - 1.1, h: 0.45, fontSize: 14, bold: true,
        color: C.slate900, fontFace: "Calibri", margin: 0,
      });
      sl.addText(F.d, {
        x: rx + 1.0, y: y + 0.55, w: rw - 1.1, h: 0.4, fontSize: 11,
        color: C.slate700, fontFace: "Calibri", margin: 0,
      });
    }

    addFooter(sl, 10, TOTAL);
  }

  // ----- SLIDE 11: REPORTS ------------------------------------------------
  {
    const sl = pres.addSlide();
    sl.background = { color: C.offwhite };
    addHeader(sl, "Raporlar ve Geçmiş", "SEANS ANALİZİ");

    // Top: 3 KPI cards
    const kpis = [
      { v: "24", l: "Tekrar", c: C.mint },
      { v: "87", l: "Form Skoru", c: C.cyan },
      { v: "2.8s", l: "Ort. Tempo", c: C.amber },
    ];
    const kw = 2.5, kh = 1.3;
    const kTotalW = kw * 3 + 0.3 * 2;
    const kStartX = 0.8;
    for (let i = 0; i < kpis.length; i++) {
      const k = kpis[i], x = kStartX + i * (kw + 0.25), y = 2.0;
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w: kw, h: kh, fill: { color: C.paper },
        line: { color: C.slate200, width: 1 }, shadow: s(),
      });
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w: kw, h: 0.08, fill: { color: k.c }, line: { color: k.c },
      });
      sl.addText(k.v, {
        x, y: y + 0.15, w: kw, h: 0.7, fontSize: 36, bold: true,
        color: k.c, align: "center", fontFace: "Calibri", margin: 0,
      });
      sl.addText(k.l, {
        x, y: y + 0.85, w: kw, h: 0.35, fontSize: 11,
        color: C.slate500, align: "center", charSpacing: 3, fontFace: "Calibri", margin: 0,
      });
    }

    // Middle: chart area (mock line chart)
    const cx = 0.8, cy = 3.5, cw = 8.0, ch = 2.2;
    sl.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: cw, h: ch, fill: { color: C.paper },
      line: { color: C.slate200, width: 1 }, shadow: s(),
    });
    sl.addText("Form Skoru — seans boyunca", {
      x: cx + 0.3, y: cy + 0.15, w: cw - 0.6, h: 0.3, fontSize: 12, bold: true,
      color: C.slate700, fontFace: "Calibri", margin: 0,
    });
    // plot
    const plx = cx + 0.6, ply = cy + 0.6, plw = cw - 0.9, plh = ch - 0.9;
    sl.addShape(pres.shapes.LINE, {
      x: plx, y: ply + plh, w: plw, h: 0.01, line: { color: C.slate200, width: 1 },
    });
    const scorePts = [0.75, 0.78, 0.82, 0.85, 0.8, 0.88, 0.9, 0.85, 0.92, 0.87, 0.9, 0.88];
    for (let i = 0; i < scorePts.length - 1; i++) {
      const x1 = plx + (i / (scorePts.length - 1)) * plw;
      const y1 = ply + (1 - scorePts[i]) * plh;
      const x2 = plx + ((i + 1) / (scorePts.length - 1)) * plw;
      const y2 = ply + (1 - scorePts[i + 1]) * plh;
      const mnx = Math.min(x1, x2), mny = Math.min(y1, y2);
      const ww = Math.max(0.01, Math.abs(x2 - x1));
      const hh = Math.max(0.01, Math.abs(y2 - y1));
      const flipV = (x1 < x2 && y1 > y2) || (x1 > x2 && y1 < y2);
      sl.addShape(pres.shapes.LINE, {
        x: mnx, y: mny, w: ww, h: hh, flipV,
        line: { color: C.mint, width: 2.5 },
      });
    }
    // Rep markers on chart
    for (let i = 0; i < scorePts.length; i += 2) {
      const x = plx + (i / (scorePts.length - 1)) * plw;
      const y = ply + (1 - scorePts[i]) * plh;
      sl.addShape(pres.shapes.OVAL, {
        x: x - 0.08, y: y - 0.08, w: 0.16, h: 0.16,
        fill: { color: C.mint }, line: { color: C.paper, width: 1.5 },
      });
    }

    // Bottom-left: SQLite note
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 5.85, w: 8.0, h: 0.75,
      fill: { color: C.navySoft }, line: { color: C.cyan, width: 1 },
    });
    const icDb = await icon(FA.FaDatabase, C.cyan, 256);
    sl.addImage({ data: icDb, x: 1.0, y: 6.05, w: 0.35, h: 0.35 });
    sl.addText("SQLite · Tüm seans geçmişi cihazda saklanıyor · Recharts görselleştirme", {
      x: 1.5, y: 5.85, w: 7.2, h: 0.75, fontSize: 12, color: C.offwhite,
      fontFace: "Calibri", valign: "middle", margin: 0,
    });

    // Right column: MedGemma summary card
    const mx = 9.1, my = 2.0, mw = 3.6, mh = 4.6;
    sl.addShape(pres.shapes.RECTANGLE, {
      x: mx, y: my, w: mw, h: mh, fill: { color: C.navy },
      line: { color: C.navy }, shadow: s(),
    });
    sl.addShape(pres.shapes.RECTANGLE, {
      x: mx, y: my, w: mw, h: 0.12, fill: { color: C.mint }, line: { color: C.mint },
    });
    const icAi = await icon(FA.FaRobot, C.mint, 256);
    sl.addImage({ data: icAi, x: mx + 0.3, y: my + 0.35, w: 0.5, h: 0.5 });
    sl.addText("MedGemma Yorumu", {
      x: mx + 0.95, y: my + 0.35, w: mw - 1.1, h: 0.5, fontSize: 14, bold: true,
      color: C.offwhite, fontFace: "Calibri", valign: "middle", margin: 0,
    });
    sl.addText(
      "\"Seansın çoğunda form skorun 85 üzerindeydi, özellikle son 3 tekrarda dengenin çok iyi. " +
      "Sol dizindeki asimetri %8 azaldı. Bir sonraki seansta kalçadan menteşe hareketini hedefle. " +
      "Bel bölgesi güvenli limitler içinde.\"",
      { x: mx + 0.3, y: my + 1.1, w: mw - 0.6, h: mh - 1.3, fontSize: 12,
        italic: true, color: C.slate200, fontFace: "Calibri", paraSpaceAfter: 6, margin: 0 }
    );

    addFooter(sl, 11, TOTAL);
  }

  // ----- SLIDE 12: KVKK & PRIVACY ----------------------------------------
  {
    const sl = pres.addSlide();
    sl.background = { color: C.navy };

    // Dark-slide header
    sl.addText("VERİ GİZLİLİĞİ", {
      x: 0.8, y: 0.5, w: 12, h: 0.3, fontSize: 12, bold: true,
      color: C.mint, charSpacing: 4, fontFace: "Calibri", margin: 0,
    });
    sl.addText("KVKK Uyumluluğu — Donanımsal Düzeyde", {
      x: 0.8, y: 0.85, w: 12, h: 0.8, fontSize: 32, bold: true,
      color: C.offwhite, fontFace: "Calibri", margin: 0,
    });
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.65, w: 0.8, h: 0.07, fill: { color: C.mint }, line: { color: C.mint },
    });

    // Big center message
    sl.addText("Hiçbir veri cihazınızdan çıkmıyor.", {
      x: 0.8, y: 2.0, w: 12, h: 0.7, fontSize: 28, bold: true,
      color: C.mint, fontFace: "Calibri", italic: true, margin: 0,
    });

    // Four checklist cards
    const items = [
      { t: "Yerel İşleme", d: "Görüntü, iskelet ve sağlık verisi tamamen yerelde", ic: FA.FaServer },
      { t: "Bulut Yok", d: "Üçüncü taraf servis veya API çağrısı yapılmıyor", ic: FA.FaCloudUploadAlt },
      { t: "KVKK 6698", d: "Özel nitelikli kişisel veri koruması garantili", ic: FA.FaShieldAlt },
      { t: "Offline MedGemma", d: "Model kullanıcının kendi GPU'sunda çalışıyor", ic: FA.FaMicrochip },
    ];
    const cw = 2.8, chh = 2.8, cgap = 0.22;
    const ctot = cw * 4 + cgap * 3;
    const cst = (SW - ctot) / 2;
    for (let i = 0; i < items.length; i++) {
      const it = items[i], x = cst + i * (cw + cgap), y = 3.0;
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cw, h: chh, fill: { color: C.navySoft }, line: { color: C.cyan, width: 1 },
      });
      sl.addShape(pres.shapes.OVAL, {
        x: x + cw / 2 - 0.5, y: y + 0.35, w: 1.0, h: 1.0,
        fill: { color: C.mint, transparency: 82 }, line: { color: C.mint, width: 1 },
      });
      const ic = await icon(it.ic, C.mint, 256);
      sl.addImage({ data: ic, x: x + cw / 2 - 0.32, y: y + 0.54, w: 0.64, h: 0.64 });
      sl.addText(it.t, {
        x: x + 0.2, y: y + 1.55, w: cw - 0.4, h: 0.45, fontSize: 16, bold: true,
        color: C.offwhite, align: "center", fontFace: "Calibri", margin: 0,
      });
      sl.addText(it.d, {
        x: x + 0.25, y: y + 2.05, w: cw - 0.5, h: 0.7, fontSize: 11,
        color: C.slate200, align: "center", fontFace: "Calibri", margin: 0,
      });
    }

    // Bottom tagline
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 6.3, w: SW - 1.6, h: 0.7,
      fill: { color: C.mintDark, transparency: 70 }, line: { color: C.mint, width: 1 },
    });
    sl.addText("Güven, verinin paylaşılmamasıyla kazanılır — altyapımızın en önemli tasarım kararı.", {
      x: 0.8, y: 6.3, w: SW - 1.6, h: 0.7, fontSize: 14, italic: true, bold: true,
      color: C.offwhite, align: "center", valign: "middle", fontFace: "Calibri", margin: 0,
    });

    // Dark-slide footer
    sl.addText("FitGuard AI  ·  TEKNOFEST Araştırma Projesi", {
      x: 0.8, y: SH - 0.4, w: 8, h: 0.3, fontSize: 9, color: C.slate500,
      fontFace: "Calibri", margin: 0,
    });
    sl.addText("12 / 14", {
      x: SW - 1.2, y: SH - 0.4, w: 0.6, h: 0.3, fontSize: 9, color: C.slate500,
      fontFace: "Calibri", align: "right", margin: 0,
    });
  }

  // ----- SLIDE 13: ORIGINAL VALUE ----------------------------------------
  {
    const sl = pres.addSlide();
    sl.background = { color: C.offwhite };
    addHeader(sl, "Özgün Değer ve Katkı", "NEDEN FARKLI?");

    // Left: big differentiators
    const diffs = [
      { t: "İlk Hibrit Yaklaşım", d: "Tıbbi AI + bireysel kalibrasyon + gerçek zamanlı CV tek platformda", ic: FA.FaLightbulb, color: C.mint },
      { t: "Ek Donanım Yok", d: "Standart web kamerası yeterli — hiçbir sensör/kinect gerekmez", ic: FA.FaCamera, color: C.cyan },
      { t: "Tüketici GPU Dostu", d: "RTX 4060 seviyesinde çalışır (4-bit quantization ~5 GB VRAM)", ic: FA.FaMicrochip, color: C.amber },
    ];
    for (let i = 0; i < diffs.length; i++) {
      const D = diffs[i], x = 0.6, y = 2.0 + i * 1.45, w = 7.5, h = 1.3;
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h, fill: { color: C.paper },
        line: { color: C.slate200, width: 1 }, shadow: s(),
      });
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 0.12, h, fill: { color: D.color }, line: { color: D.color },
      });
      sl.addShape(pres.shapes.OVAL, {
        x: x + 0.4, y: y + 0.3, w: 0.7, h: 0.7,
        fill: { color: D.color, transparency: 82 }, line: { color: D.color, width: 1 },
      });
      const ic = await icon(D.ic, D.color, 256);
      sl.addImage({ data: ic, x: x + 0.5, y: y + 0.4, w: 0.5, h: 0.5 });
      sl.addText(D.t, {
        x: x + 1.3, y: y + 0.2, w: w - 1.5, h: 0.5, fontSize: 18, bold: true,
        color: C.slate900, fontFace: "Calibri", margin: 0,
      });
      sl.addText(D.d, {
        x: x + 1.3, y: y + 0.72, w: w - 1.5, h: 0.55, fontSize: 12,
        color: C.slate700, fontFace: "Calibri", margin: 0,
      });
    }

    // Right: supported exercises panel
    const ex = [
      { name: "Squat", ic: FA.FaRunning },
      { name: "Deadlift", ic: FA.FaWeightHanging },
      { name: "Biceps Curl", ic: FA.FaDumbbell },
      { name: "Shoulder Press", ic: FA.FaHandRock },
      { name: "Lateral Raise", ic: FA.FaArrowsAltH },
      { name: "Push-up", ic: FA.FaHandPaper },
    ];
    const ebx = 8.6, eby = 2.0, ebw = 4.2, ebh = 4.4;
    sl.addShape(pres.shapes.RECTANGLE, {
      x: ebx, y: eby, w: ebw, h: ebh, fill: { color: C.navy },
      line: { color: C.navy }, shadow: s(),
    });
    sl.addText("Desteklenen Egzersizler", {
      x: ebx + 0.3, y: eby + 0.25, w: ebw - 0.6, h: 0.4, fontSize: 15, bold: true,
      color: C.mint, fontFace: "Calibri", margin: 0,
    });
    sl.addText("6+ hareket — MVP aşamasında", {
      x: ebx + 0.3, y: eby + 0.7, w: ebw - 0.6, h: 0.3, fontSize: 10,
      color: C.slate500, italic: true, fontFace: "Calibri", margin: 0,
    });
    for (let i = 0; i < ex.length; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const iw = (ebw - 0.7) / 2;
      const x = ebx + 0.3 + col * (iw + 0.1);
      const y = eby + 1.15 + row * 1.05;
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w: iw, h: 0.95, fill: { color: C.navySoft }, line: { color: C.cyan, width: 1 },
      });
      const ic = await icon(ex[i].ic, C.mint, 256);
      sl.addImage({ data: ic, x: x + 0.2, y: y + 0.25, w: 0.45, h: 0.45 });
      sl.addText(ex[i].name, {
        x: x + 0.75, y, w: iw - 0.8, h: 0.95, fontSize: 12, bold: true,
        color: C.offwhite, fontFace: "Calibri", valign: "middle", margin: 0,
      });
    }

    addFooter(sl, 13, TOTAL);
  }

  // ----- SLIDE 14: CLOSING -----------------------------------------------
  {
    const sl = pres.addSlide();
    sl.background = { color: C.navy };

    // Decorative circles
    sl.addShape(pres.shapes.OVAL, {
      x: SW - 4, y: -2, w: 6, h: 6,
      fill: { color: C.mint, transparency: 88 }, line: { color: C.navy, width: 1 },
    });
    sl.addShape(pres.shapes.OVAL, {
      x: -2, y: SH - 3, w: 5, h: 5,
      fill: { color: C.cyan, transparency: 90 }, line: { color: C.navy, width: 1 },
    });

    // Kicker
    sl.addText("SONUÇ", {
      x: 0.8, y: 0.7, w: 12, h: 0.35, fontSize: 12, bold: true,
      color: C.mint, charSpacing: 4, fontFace: "Calibri", margin: 0,
    });
    // Big statement
    sl.addText("Güvenli egzersiz lüks değil —\nherkesin hakkı olmalı.", {
      x: 0.8, y: 1.2, w: 12, h: 2.0, fontSize: 44, bold: true,
      color: C.offwhite, fontFace: "Calibri", margin: 0,
    });
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 3.3, w: 1.0, h: 0.08, fill: { color: C.mint }, line: { color: C.mint },
    });

    // Three impact cards
    const imp = [
      { t: "Toplum Sağlığı", d: "Sakatlıkları önleyerek fiziksel aktiviteye katılımı artırır", ic: FA.FaHeartbeat, color: C.coral },
      { t: "KVKK Uyumlu Model", d: "Gizlilik odaklı sağlık teknolojisi için referans mimari", ic: FA.FaLock, color: C.cyan },
      { t: "Gelecek Vizyonu", d: "Fizyoterapist paneli · mobil · derinlik kamerası · fine-tuning", ic: FA.FaRocket, color: C.mint },
    ];
    const iw = 3.9, ih = 2.4, ig = 0.3;
    const ist = (SW - (iw * 3 + ig * 2)) / 2;
    for (let i = 0; i < imp.length; i++) {
      const I = imp[i], x = ist + i * (iw + ig), y = 3.7;
      sl.addShape(pres.shapes.RECTANGLE, {
        x, y, w: iw, h: ih, fill: { color: C.navySoft }, line: { color: I.color, width: 1.5 },
      });
      sl.addShape(pres.shapes.OVAL, {
        x: x + 0.3, y: y + 0.3, w: 0.7, h: 0.7,
        fill: { color: I.color, transparency: 82 }, line: { color: I.color, width: 1 },
      });
      const ic = await icon(I.ic, I.color, 256);
      sl.addImage({ data: ic, x: x + 0.4, y: y + 0.4, w: 0.5, h: 0.5 });
      sl.addText(I.t, {
        x: x + 1.2, y: y + 0.35, w: iw - 1.4, h: 0.5, fontSize: 17, bold: true,
        color: I.color, fontFace: "Calibri", valign: "middle", margin: 0,
      });
      sl.addText(I.d, {
        x: x + 0.35, y: y + 1.15, w: iw - 0.7, h: 1.1, fontSize: 12,
        color: C.slate200, fontFace: "Calibri", margin: 0,
      });
    }

    // Thanks
    sl.addText("Teşekkürler  ·  FitGuard AI", {
      x: 0.8, y: SH - 0.85, w: 12, h: 0.5, fontSize: 20, bold: true,
      color: C.offwhite, align: "center", fontFace: "Calibri", charSpacing: 3, margin: 0,
    });
    sl.addText("Kişisel · Yerel · Gerçek Zamanlı", {
      x: 0.8, y: SH - 0.45, w: 12, h: 0.35, fontSize: 12, italic: true,
      color: C.mint, align: "center", fontFace: "Calibri", margin: 0,
    });
  }

  // ----- Write -------------------------------------------------------------
  const out = "C:/Users/Utku35/Desktop/teknofest/Araştırma Projesi/Yeni klasör/sunum/FitGuardAI_TEKNOFEST.pptx";
  await pres.writeFile({ fileName: out });
  console.log("WROTE:", out);
}

build().catch((e) => { console.error(e); process.exit(1); });
