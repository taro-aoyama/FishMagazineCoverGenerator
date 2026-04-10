import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  UploadCloud,
  Download,
  Loader2,
  Image as ImageIcon,
  LayoutTemplate,
  Move,
  ZoomIn,
  Shuffle,
} from "lucide-react";
// @ts-ignore
import { Fish as FishIcon } from "lucide-react";
import { removeBackground, Config } from "@imgly/background-removal";

const THEMES = [
  {
    id: "general",
    name: "釣り（総合）",
    bgColor: "#cfc4b6",
    accentColor: "#c0392b",
    title: "HOOK & TACKLE",
  },
  {
    id: "bass",
    name: "ブラックバス系",
    bgColor: "#97a292",
    accentColor: "#d35400",
    title: "BASS STRIKE",
  },
  {
    id: "trout",
    name: "トラウト系",
    bgColor: "#d8ab8a",
    accentColor: "#2c3e50",
    title: "TROUT & STREAM",
  },
  {
    id: "shore",
    name: "ソルトウォーター（ショア）",
    bgColor: "#c3c6b8",
    accentColor: "#2980b9",
    title: "SALT ANGLER",
  },
  {
    id: "offshore",
    name: "ソルトウォーター（オフショア）",
    bgColor: "#899fb2",
    accentColor: "#e74c3c",
    title: "OCEAN GAME",
  },
];

// ランダムに選ばれる特集記事のマスターリスト（30種類に増強！）
const HEADLINES = [
  {
    accent: "SECRET",
    title: "LOCATIONS",
    sub1: "Expert Tackle Guide",
    sub2: "Monster Tactics",
  },
  {
    accent: "LUNKER",
    title: "HUNTER",
    sub1: "The 10lb Club",
    sub2: "Bait & Switch",
  },
  {
    accent: "PRO",
    title: "SECRETS",
    sub1: "Tournament Winning Lures",
    sub2: "Read The Water",
  },
  {
    accent: "WILD",
    title: "CATCH",
    sub1: "Action On Topwater",
    sub2: "Night Fishing Guide",
  },
  {
    accent: "FIGHT",
    title: "CLUB",
    sub1: "Heavy Tackle Basics",
    sub2: "Never Lose A Big One",
  },
  {
    accent: "LURE",
    title: "MAKING",
    sub1: "DIY Custom Baits",
    sub2: "Color Theory Explained",
  },
  {
    accent: "TROPHY",
    title: "WALL",
    sub1: "Record Breaking Catches",
    sub2: "How To Mount Your Fish",
  },
  {
    accent: "SPRING",
    title: "FEVER",
    sub1: "Pre-Spawn Patterns",
    sub2: "Jigging For Monsters",
  },
  {
    accent: "MASTER",
    title: "CLASS",
    sub1: "Knot Tying Essentials",
    sub2: "Hook Selection Guide",
  },
  {
    accent: "DEEP",
    title: "WATER",
    sub1: "Sonar Tactics 101",
    sub2: "Finding The Drop-Offs",
  },
  {
    accent: "SURE",
    title: "FIRE",
    sub1: "Top 10 Plastic Baits",
    sub2: "Rigging Like A Pro",
  },
  {
    accent: "WEEKEND",
    title: "WARRIOR",
    sub1: "Quick Escape Spots",
    sub2: "Family Fishing Gear",
  },
  {
    accent: "TOUGH",
    title: "BITE",
    sub1: "Finesse Techniques",
    sub2: "Downsizing Your Lures",
  },
  {
    accent: "RIVER",
    title: "MONSTERS",
    sub1: "Current Strategies",
    sub2: "Casting The Eddies",
  },
  {
    accent: "GEAR",
    title: "GUIDE",
    sub1: "New Reels Tested",
    sub2: "Rods For Every Budget",
  },
  {
    accent: "BOAT",
    title: "BUYER",
    sub1: "Jon Boats To Bass Boats",
    sub2: "Maintenance Tips",
  },
  {
    accent: "SHORE",
    title: "POUNDER",
    sub1: "Bank Fishing Secrets",
    sub2: "Walking The Coast",
  },
  {
    accent: "FLY",
    title: "FISHING",
    sub1: "Matching The Hatch",
    sub2: "Perfecting Your Cast",
  },
  {
    accent: "KAYAK",
    title: "TACTICS",
    sub1: "Stealth Approaches",
    sub2: "Rigging Your Yak",
  },
  {
    accent: "BIG",
    title: "SWIMBAITS",
    sub1: "Throwing The Matt",
    sub2: "Commit To The Bite",
  },
  {
    accent: "ICE",
    title: "OUT",
    sub1: "Early Season Action",
    sub2: "Cold Water Basics",
  },
  {
    accent: "FROGGING",
    title: "SEASON",
    sub1: "Slop Fishing 101",
    sub2: "Heavy Braid Needs",
  },
  {
    accent: "FALL",
    title: "FEED",
    sub1: "Chasing Bait Balls",
    sub2: "Crankbait Mastery",
  },
  {
    accent: "NIGHT",
    title: "STALKER",
    sub1: "Darkness Strategies",
    sub2: "Black Lure Magic",
  },
  {
    accent: "SURVIVAL",
    title: "KIT",
    sub1: "What To Bring",
    sub2: "First Aid For Hookups",
  },
  {
    accent: "CATCH &",
    title: "RELEASE",
    sub1: "Fish Care Secrets",
    sub2: "Livewell Management",
  },
  {
    accent: "URBAN",
    title: "ANGLER",
    sub1: "City Pond Secrets",
    sub2: "Concrete Jungle Fish",
  },
  {
    accent: "WEATHER",
    title: "WATCH",
    sub1: "Fishing The Fronts",
    sub2: "Barometric Pressure",
  },
  {
    accent: "KIDS",
    title: "CORNER",
    sub1: "Taking Youth Fishing",
    sub2: "Simple Bobber Rigs",
  },
  {
    accent: "LEGENDS",
    title: "OF BASS",
    sub1: "Interviews With Pros",
    sub2: "Classic Tournaments",
  },
];

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // AI状態
  const [workerStatus, setWorkerStatus] = useState<
    "idle" | "processing" | "complete" | "error"
  >("idle");
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [magazineConfig, setMagazineConfig] = useState<any>(null);

  // キャンバス・画像状態
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState<number>(0.95);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("general");

  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null,
  );
  const [personFishImage, setPersonFishImage] =
    useState<HTMLImageElement | null>(null);

  // ドラッグ操作関連のステート
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const offsetStartRef = useRef<{ x: number; y: number } | null>(null);

  const selectedTheme =
    THEMES.find((t) => t.id === selectedThemeId) || THEMES[0];

  // ランダムレイアウトの生成
  const shuffleLayout = useCallback(() => {
    const year = Math.floor(Math.random() * (1998 - 1960 + 1)) + 1960;
    const vol = Math.floor(Math.random() * 99) + 1;
    const month = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ][Math.floor(Math.random() * 12)];

    const shuffled = [...HEADLINES].sort(() => 0.5 - Math.random());
    const layoutPattern = Math.floor(Math.random() * 5); // 0〜4 の5パターン

    setMagazineConfig({
      year,
      vol,
      month,
      headlines: shuffled.slice(0, 4),
      layoutPattern,
    });
  }, []);

  // ドラッグ操作ロジック
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (workerStatus !== "complete") return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    offsetStartRef.current = { x: offsetX, y: offsetY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (
      !isDragging ||
      !dragStartRef.current ||
      !offsetStartRef.current ||
      !canvasRef.current
    )
      return;

    // Canvasの表示DOMサイズを取得し、内部描画サイズ(800x1050)への変換比率を計算
    const rect = canvasRef.current.getBoundingClientRect();
    const ratioX = 800 / rect.width;
    const ratioY = 1050 / rect.height;

    // 変位を内部座標スケールに変換
    const deltaX = (e.clientX - dragStartRef.current.x) * ratioX;
    const deltaY = (e.clientY - dragStartRef.current.y) * ratioY;

    setOffsetX(offsetStartRef.current.x + deltaX);
    setOffsetY(offsetStartRef.current.y + deltaY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // 画像アップロード処理
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === "string") {
          setImageSrc(event.target.result);
          setWorkerStatus("idle");
          setPersonFishImage(null);
          setScale(1.0);
          setOffsetY(0);
          setProgressMsg("");

          const img = new Image();
          img.onload = () => setOriginalImage(img);
          img.src = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startExtraction = async () => {
    if (!imageSrc || !originalImage) return;
    setWorkerStatus("processing");
    setProgressMsg("魔法の前景抽出を実行中...");

    try {
      // @imgly による背景透過抽出
      const config: Config = {
        progress: (key, current, total) => {
          if (key.includes("fetch"))
            setProgressMsg("モデルをダウンロード/ロード中...");
          if (key.includes("compute"))
            setProgressMsg("画像を解析し、人物と魚を綺麗に切り抜いています...");
        },
      };

      const imageBlob = await removeBackground(imageSrc, config);
      const url = URL.createObjectURL(imageBlob);

      const fgImg = new Image();
      fgImg.onload = () => {
        setPersonFishImage(fgImg);
        setWorkerStatus("complete");
        // 初回抽出時にもレイアウトシードを生成する
        shuffleLayout();
      };
      fgImg.src = url;
    } catch (error: any) {
      console.error(error);
      setWorkerStatus("error");
      setProgressMsg(error?.message || "抽出中にエラーが発生しました");
    }
  };

  // 雑誌風レイアウト描画
  const drawCanvas = useCallback(() => {
    if (!originalImage || !canvasRef.current || !imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // アスペクト比をA4（雑誌）に近い比率に強制する（またはオリジナル比率から縦長に保つ）
    const dpr = window.devicePixelRatio || 1;
    const targetWidth = 800;
    const targetHeight = 1050; // 釣り雑誌の表紙らしい比率（1:1.3程度）

    canvas.width = targetWidth * dpr;
    canvas.height = targetHeight * dpr;
    ctx.scale(dpr, dpr);
    // CSS上の表示サイズ
    canvas.style.width = `100%`;
    canvas.style.maxWidth = "600px";
    canvas.style.aspectRatio = `${targetWidth}/${targetHeight}`;
    canvas.style.height = "auto";

    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // [0] 抽出完了前のプレビュー表示（テーマや雑誌UIは処理が終わるまで隠す）
    if (workerStatus !== "complete") {
      ctx.fillStyle = "#0f172a"; // slate-900
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.save();
      const baseScale =
        Math.min(
          targetWidth / originalImage.width,
          targetHeight / originalImage.height,
        ) * 0.9;
      const w = originalImage.width * baseScale;
      const h = originalImage.height * baseScale;
      ctx.drawImage(
        originalImage,
        (targetWidth - w) / 2,
        (targetHeight - h) / 2,
        w,
        h,
      );
      ctx.restore();
      return; // 描画をこれで終了
    }

    // 1. 背景の描画 (レトロカラーのソリッド背景)
    ctx.fillStyle = selectedTheme.bgColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = "#000";
    for (let i = 0; i < 5000; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * targetWidth,
        Math.random() * targetHeight,
        Math.random() * 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();

    // 2. 巨大なタイトルロゴを描画（前景の「後ろ」）
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.font = '900 130px Impact, "Arial Black", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;

    // Canvasの第4引数 (maxWidth=740px) を指定し、どんなに長いタイトルでも絶対に左右30pxの余白内に縮小して収める
    ctx.fillText(selectedTheme.title, targetWidth / 2, 50, targetWidth - 60);
    ctx.shadowColor = "transparent";

    // 3. その他背面のヘッダーテキスト
    ctx.fillStyle = "#ffffff";
    ctx.font = 'bold 24px "Courier New", Courier, monospace';
    ctx.textAlign = "left";
    if (magazineConfig) {
      ctx.fillText(
        `EST. ${magazineConfig.year} | VOL.${magazineConfig.vol} / ${magazineConfig.month} ISSUE`,
        40,
        25,
      );
    }

    // 4. 前景（人物＋魚）の描画（タイトルロゴの上に乗せる立体感）
    if (workerStatus === "complete" && personFishImage) {
      ctx.save();

      // 良い感じのドロップシャドウで雑誌の切り抜きっぽさを演出
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetX = 10;
      ctx.shadowOffsetY = 20;

      // 前景画像を全体としてスケーリング
      const baseHeight = targetHeight * 0.85; // デフォルトで画面の85%の高さ
      const drawHeight = baseHeight * scale;
      const drawWidth =
        drawHeight * (personFishImage.width / personFishImage.height);

      // 中央ベース位置に、ユーザーのドラッグによる offsetX / offsetY を加算
      const drawX = (targetWidth - drawWidth) / 2 + offsetX;
      const drawY = targetHeight - drawHeight + offsetY;

      ctx.drawImage(personFishImage, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
    }

    // 5. 雑誌の手前側にくるキャッチコピー等の描画
    if (workerStatus === "complete" && magazineConfig) {
      const { headlines: hl, layoutPattern } = magazineConfig;

      // 影を強めに設定して文字の視認性を高める
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 12;
      ctx.textBaseline = "top";

      // 共通描画コンポーネント（ヘルパー関数）
      const drawStandard = (
        item: any,
        x: number,
        y: number,
        align: "left" | "right",
        italicAccent = false,
      ) => {
        ctx.textAlign = align;
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = selectedTheme.accentColor;
        ctx.font = `${italicAccent ? "italic " : ""}900 36px Impact, sans-serif`;
        ctx.fillText(`${item.accent} ${item.title}`, x, y);
        ctx.fillStyle = "#ffffff";
        ctx.font = 'bold 20px "Times New Roman", Times, serif';
        ctx.fillText(item.sub1, x, y + 40);
        ctx.fillStyle = "#dddddd";
        ctx.fillText(item.sub2, x, y + 65);
      };

      const drawCallout = (
        item: any,
        x: number,
        y: number,
        align: "left" | "right",
      ) => {
        ctx.textAlign = align;
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 45px Impact, sans-serif";
        ctx.fillText(item.accent, x, y);
        ctx.fillStyle = selectedTheme.accentColor;
        ctx.fillText(item.title, x, y + 45);
        ctx.fillStyle = "#ffffff";
        ctx.font = 'italic 20px "Times New Roman", Times, serif';
        ctx.fillText(`- ${item.sub1} -`, x, y + 100);
      };

      const drawRibbon = (item: any, by: number, align: "left" | "right") => {
        ctx.textAlign = align;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.fillStyle = selectedTheme.accentColor;

        if (align === "right") {
          ctx.fillRect(targetWidth - 420, by, 420, 55);
          ctx.shadowColor = "transparent";
          ctx.fillStyle = "#000000";
          ctx.font = "900 42px Impact, sans-serif";
          ctx.fillText(
            `${item.accent} ${item.title}`,
            targetWidth - 40,
            by + 5,
          );
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.fillStyle = "#ffffff";
          ctx.font = 'bold 22px "Courier New", Courier, monospace';
          ctx.fillText(item.sub1, targetWidth - 40, by + 65);
          ctx.fillStyle = "#dddddd";
          ctx.font = 'bold 18px "Times New Roman", Times, serif';
          ctx.fillText(item.sub2, targetWidth - 40, by + 90);
        } else {
          ctx.fillRect(0, by, 420, 55);
          ctx.shadowColor = "transparent";
          ctx.fillStyle = "#000000";
          ctx.font = "900 42px Impact, sans-serif";
          ctx.fillText(`${item.accent} ${item.title}`, 40, by + 5);
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.fillStyle = "#ffffff";
          ctx.font = 'bold 22px "Courier New", Courier, monospace';
          ctx.fillText(item.sub1, 40, by + 65);
          ctx.fillStyle = "#dddddd";
          ctx.font = 'bold 18px "Times New Roman", Times, serif';
          ctx.fillText(item.sub2, 40, by + 90);
        }
      };

      // 5つのダイナミック・レイアウトパターン
      switch (layoutPattern) {
        case 0:
          // Pattern 0: 王道レイアウト (左スタック＆右リボン)
          drawStandard(hl[0], 40, 200, "left", true);
          drawStandard(hl[1], 40, 320, "left");
          drawCallout(hl[2], targetWidth - 40, 300, "right");
          drawRibbon(hl[3], targetHeight * 0.75, "right");
          break;

        case 1:
          // Pattern 1: 右スタック＆左リボン (Reverse)
          drawStandard(hl[0], targetWidth - 40, 250, "right", true);
          drawStandard(hl[1], targetWidth - 40, 400, "right");
          drawCallout(hl[2], 40, 480, "left");
          drawRibbon(hl[3], targetHeight * 0.65, "left");
          break;

        case 2:
          // Pattern 2: スカベンジャー (四隅に異なる形状を配置、最下部にワイドリボン)
          drawStandard(hl[0], 40, 220, "left", true);
          drawCallout(hl[1], targetWidth - 40, 220, "right");
          drawStandard(hl[2], 40, targetHeight * 0.65, "left");
          drawRibbon(hl[3], targetHeight * 0.82, "right");
          break;

        case 3:
          // Pattern 3: デフト・ウォール (左側に記事を集中させ、右空間を空ける)
          drawStandard(hl[0], 40, 250, "left", true);
          drawStandard(hl[1], 40, 400, "left");
          drawRibbon(hl[2], targetHeight * 0.7, "left");
          drawCallout(hl[3], targetWidth - 40, 200, "right"); // 右側はワンポイントのみ
          break;

        case 4:
          // Pattern 4: 天地強調 (中央をがっつり空けて被写体を目立たせる)
          drawCallout(hl[0], 40, 200, "left");
          drawCallout(hl[1], targetWidth - 40, 200, "right");
          drawRibbon(hl[2], targetHeight * 0.65, "left");
          drawRibbon(hl[3], targetHeight * 0.85, "right");
          break;
      }

      // [4] バーコードの描画（UPC風の正方形に近いプロポーション）
      const drawBarcode = (x: number, y: number) => {
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#ffffff";
        const boxWidth = 105;
        const boxHeight = 75;
        ctx.fillRect(x, y, boxWidth, boxHeight);

        ctx.shadowColor = "transparent";
        ctx.fillStyle = "#000000";
        let cursor = x + 8;
        // 幅を縮めて高さを持たせたバーコード
        const bars = [2, 1, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 1, 2, 1, 3];
        bars.forEach((w, i) => {
          ctx.fillRect(cursor, y + 8, w * 1.5, 45);
          cursor += w * 1.5 + (i % 3 === 0 ? 2.5 : 1.5);
        });

        ctx.font = 'bold 11px "Courier New", Courier, monospace';
        ctx.textAlign = "center";
        // 中央揃えにして白枠からのハミ出しを極力防止
        ctx.fillText("0 74470 56219 8", x + boxWidth / 2, y + 66);
        ctx.restore();
      };

      // レイアウトごとの空きスペースに合わせてバーコードを配置
      let barcodeX = 40;
      let barcodeY = targetHeight - 105; // 縦長になった分上げる
      if (layoutPattern === 1 || layoutPattern === 3) {
        barcodeX = targetWidth - 145; // 105px幅+余白
      } else if (layoutPattern === 4) {
        barcodeX = targetWidth / 2 - 52.5; // 中央配置
      }

      drawBarcode(barcodeX, barcodeY);
    }
  }, [
    originalImage,
    personFishImage,
    scale,
    offsetX,
    offsetY,
    selectedTheme,
    workerStatus,
    imageSrc,
    magazineConfig,
  ]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `fish-magazine-cover-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png", 1.0);
    link.click();
  };

  const isWorking = workerStatus === "processing";
  const isDone = workerStatus === "complete";

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* ヘッダー — コンパクト */}
      <header className="sticky top-0 z-30 bg-[#0A0F1C]/80 backdrop-blur-lg border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex items-center gap-2.5 px-4 py-3 md:py-4">
          <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <FishIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-base md:text-lg font-bold text-slate-100 tracking-tight">
            釣り雑誌の表紙風ジェネレーター
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* アップロード前: 中央配置のアップロードエリア */}
        {!imageSrc && (
          <div className="flex flex-col items-center justify-center animate-fade-in-up" style={{ minHeight: "calc(100vh - 120px)" }}>
            <label className="group relative flex flex-col items-center justify-center w-full max-w-md aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-600/60 hover:border-indigo-400/50 bg-slate-800/20 hover:bg-indigo-950/20 cursor-pointer transition-all duration-300">
              <div className="flex flex-col items-center gap-4 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white mb-1">釣果写真をアップロード</p>
                  <p className="text-sm text-slate-500">人物入り・横持ちの写真が最適</p>
                </div>
                <span className="text-xs text-slate-600 mt-2">JPG / PNG / WebP</span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        )}

        {/* アップロード後: キャンバス + 操作パネル */}
        {imageSrc && (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center lg:items-start justify-center animate-fade-in">
            {/* キャンバスエリア */}
            <div className="w-full max-w-[520px] flex flex-col items-center shrink-0">
              <div
                className="relative w-full rounded-xl overflow-hidden bg-[#0f172a] shadow-2xl shadow-black/40"
                style={{ maxWidth: "520px", aspectRatio: "800/1050" }}
              >
                <canvas
                  ref={canvasRef}
                  className={`w-full h-full touch-none ${isDone ? "cursor-grab active:cursor-grabbing" : ""}`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                />
                {isWorking && (
                  <div className="absolute inset-0 bg-[#0A0F1C]/85 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
                    <p className="text-sm font-semibold text-slate-300 px-4 text-center">
                      {progressMsg}
                    </p>
                  </div>
                )}
              </div>
              {isDone && (
                <p className="text-xs text-slate-600 mt-3 flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5" />
                  キャンバス上で被写体をドラッグして移動
                </p>
              )}
            </div>

            {/* 操作パネル */}
            <div className="w-full lg:w-[340px] shrink-0 lg:sticky lg:top-20 flex flex-col gap-4">
              {!isDone ? (
                /* 抽出開始パネル */
                <div className="glass-panel rounded-xl p-5">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                    表紙を生成
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    AIが人物と魚を自動で切り抜き、雑誌風に合成します
                  </p>
                  <button
                    onClick={startExtraction}
                    disabled={isWorking}
                    className={`w-full py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                      isWorking
                        ? "bg-indigo-600/40 text-indigo-200 cursor-wait"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98]"
                    }`}
                  >
                    {isWorking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LayoutTemplate className="w-4 h-4" />
                    )}
                    {isWorking ? "抽出中..." : "背景を消して雑誌にする"}
                  </button>
                </div>
              ) : (
                /* 編集パネル群 */
                <div className="flex flex-col gap-4 animate-fade-in">
                  {/* テーマ選択 */}
                  <div className="glass-panel rounded-xl p-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      テーマ
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedThemeId(theme.id)}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                            selectedThemeId === theme.id
                              ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                              : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-300"
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-black/20"
                            style={{ backgroundColor: theme.bgColor }}
                          />
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* サイズ調整 */}
                  <div className="glass-panel rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ZoomIn className="w-3.5 h-3.5" />
                        サイズ
                      </h3>
                      <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {Math.round(scale * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* アクションボタン群 */}
                  <div className="flex gap-2">
                    <button
                      onClick={shuffleLayout}
                      className="flex-1 py-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.06] text-slate-300 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-[0.97]"
                    >
                      <Shuffle className="w-4 h-4" />
                      シャッフル
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.97]"
                    >
                      <Download className="w-4 h-4" />
                      保存
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setImageSrc(null);
                      setWorkerStatus("idle");
                      setProgressMsg("");
                    }}
                    className="py-2.5 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all font-medium"
                  >
                    別の写真でやり直す
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
