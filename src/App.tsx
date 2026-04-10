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
  Share,
  X,
} from "lucide-react";
// @ts-ignore
import { Fish as FishIcon } from "lucide-react";
import { removeBackground, Config } from "@imgly/background-removal";
import heic2any from "heic2any";
import barcodeUrl from "./assets/10912071.png";

const THEMES = [
  {
    id: "general",
    name: "釣り（総合）",
    bgColor: "#d4c89e",
    accentColor: "#8b1a1a",
    title: "HOOK & TACKLE",
    subtitle: "America's Favorite Fishing Magazine",
  },
  {
    id: "bass",
    name: "ブラックバス系",
    bgColor: "#3b5e3a",
    accentColor: "#d4a017",
    title: "BASS STRIKE",
    subtitle: "The Largemouth Authority Since 1962",
  },
  {
    id: "trout",
    name: "トラウト系",
    bgColor: "#c2a67a",
    accentColor: "#2e4a3e",
    title: "TROUT & STREAM",
    subtitle: "For The Dedicated Fly Fisherman",
  },
  {
    id: "shore",
    name: "ソルトウォーター（ショア）",
    bgColor: "#1e3a5f",
    accentColor: "#c9a84c",
    title: "SALT ANGLER",
    subtitle: "Surf, Pier & Jetty Fishing Journal",
  },
  {
    id: "offshore",
    name: "ソルトウォーター（オフショア）",
    bgColor: "#4a1c1c",
    accentColor: "#d4a54a",
    title: "OCEAN GAME",
    subtitle: "Big Game Fishing Worldwide",
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

  // バーコード画像の事前読み込み
  const [barcodeImage, setBarcodeImage] = useState<HTMLImageElement | null>(
    null,
  );
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBarcodeImage(img);
    img.src = barcodeUrl;
  }, []);

  // iOS Safariインストール誘導バナー
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  useEffect(() => {
    const isIos = /iPhone|iPad/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true;
    const now = Date.now();
    const lastVisit = localStorage.getItem("last-visit");
    const hasLongGap = lastVisit && (now - Number(lastVisit)) > 7 * 24 * 60 * 60 * 1000;
    if (hasLongGap) {
      localStorage.removeItem("install-banner-dismissed");
    }
    localStorage.setItem("last-visit", String(now));
    const dismissed = localStorage.getItem("install-banner-dismissed");
    if (isIos && !isStandalone && !dismissed) {
      setShowInstallBanner(true);
    }
  }, []);

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem("install-banner-dismissed", String(Date.now()));
  };

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

    // 年代に合わせたヴィンテージ価格
    const prices = year < 1970
      ? ["35¢", "40¢", "50¢", "25¢"]
      : year < 1980
        ? ["75¢", "85¢", "$1.00", "60¢"]
        : ["$1.25", "$1.50", "$1.75", "$1.95"];
    const price = prices[Math.floor(Math.random() * prices.length)];

    setMagazineConfig({
      year,
      vol,
      month,
      headlines: shuffled.slice(0, 4),
      layoutPattern,
      price,
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

  // HEIC/HEIFファイルかどうかを判定
  const isHeic = (file: File): boolean => {
    const name = file.name.toLowerCase();
    return (
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      name.endsWith(".heic") ||
      name.endsWith(".heif")
    );
  };

  // データURLから画像をセットする共通処理
  const loadImageFromDataUrl = (dataUrl: string) => {
    setImageSrc(dataUrl);
    setWorkerStatus("idle");
    setPersonFishImage(null);
    setScale(1.0);
    setOffsetY(0);
    setProgressMsg("");

    const img = new Image();
    img.onload = () => setOriginalImage(img);
    img.src = dataUrl;
  };

  // 画像アップロード処理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isHeic(file)) {
      setProgressMsg("HEIC画像を変換中...");
      setWorkerStatus("processing");
      try {
        const blob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.92,
        });
        const jpeg = Array.isArray(blob) ? blob[0] : blob;
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result && typeof event.target.result === "string") {
            loadImageFromDataUrl(event.target.result);
          }
        };
        reader.readAsDataURL(jpeg);
      } catch (err: any) {
        // ブラウザが既に読める形式の場合、canvasでJPEGに再エンコードする
        if (err?.code === 1) {
          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            const cvs = document.createElement("canvas");
            cvs.width = img.naturalWidth;
            cvs.height = img.naturalHeight;
            cvs.getContext("2d")!.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            loadImageFromDataUrl(cvs.toDataURL("image/jpeg", 0.92));
          };
          img.src = url;
          return;
        }
        console.error(err);
        setWorkerStatus("error");
        setProgressMsg("HEIC変換に失敗しました");
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === "string") {
        loadImageFromDataUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
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

    // 紙の黄ばみ・経年劣化感をオーバーレイ
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#a08040";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.restore();

    // 粗い紙テクスチャ（ノイズを強化）
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = "#000";
    for (let i = 0; i < 8000; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * targetWidth,
        Math.random() * targetHeight,
        Math.random() * 2.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();

    // 細い横線（印刷ムラ風）
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 0.5;
    for (let y = 0; y < targetHeight; y += 3 + Math.random() * 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(targetWidth, y);
      ctx.stroke();
    }
    ctx.restore();

    // ビネット効果（四隅の暗がり）
    ctx.save();
    const vGrad = ctx.createRadialGradient(
      targetWidth / 2, targetHeight / 2,
      targetWidth * 0.3,
      targetWidth / 2, targetHeight / 2,
      targetWidth * 0.9,
    );
    vGrad.addColorStop(0, "rgba(0,0,0,0)");
    vGrad.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.restore();

    // 2. 上部の装飾ライン
    ctx.save();
    ctx.strokeStyle = selectedTheme.accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, 18);
    ctx.lineTo(targetWidth - 30, 18);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 23);
    ctx.lineTo(targetWidth - 30, 23);
    ctx.stroke();
    ctx.restore();

    // 3. ヘッダー情報（EST. / VOL. / 価格）
    ctx.textBaseline = "top";
    if (magazineConfig) {
      ctx.fillStyle = "#ffffff";
      ctx.font = 'bold 18px Georgia, "Times New Roman", serif';
      ctx.textAlign = "left";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;
      ctx.fillText(
        `EST. ${magazineConfig.year}  ·  VOL. ${magazineConfig.vol}  ·  ${magazineConfig.month} ISSUE`,
        40,
        30,
      );

      // 価格表記（右上）
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = 'bold 22px Georgia, "Times New Roman", serif';
      ctx.fillText(magazineConfig.price, targetWidth - 40, 28);
      ctx.shadowColor = "transparent";
    }

    // 4. タイトルロゴ下の装飾ライン
    ctx.save();
    ctx.strokeStyle = selectedTheme.accentColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 52);
    ctx.lineTo(targetWidth - 30, 52);
    ctx.stroke();
    ctx.restore();

    // 5. 巨大なタイトルロゴを描画（前景の「後ろ」）
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.font = '900 120px Georgia, "Times New Roman", serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    ctx.fillText(selectedTheme.title, targetWidth / 2, 58, targetWidth - 60);
    ctx.shadowColor = "transparent";

    // 6. サブタイトル（タイトルロゴの下）
    ctx.fillStyle = "#ffffff";
    ctx.font = 'italic 18px Georgia, "Times New Roman", serif';
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 4;
    ctx.fillText(selectedTheme.subtitle, targetWidth / 2, 180);
    ctx.shadowColor = "transparent";

    // サブタイトル下の装飾ライン
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(targetWidth * 0.25, 205);
    ctx.lineTo(targetWidth * 0.75, 205);
    ctx.stroke();
    ctx.restore();

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

      // 共通描画コンポーネント（ヘルパー関数）— レトロセリフ体ベース
      const drawStandard = (
        item: any,
        x: number,
        y: number,
        align: "left" | "right",
        italicAccent = false,
      ) => {
        ctx.textAlign = align;
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 8;
        ctx.fillStyle = selectedTheme.accentColor;
        ctx.font = `${italicAccent ? "italic " : ""}bold 34px Georgia, "Times New Roman", serif`;
        ctx.fillText(`${item.accent} ${item.title}`, x, y);
        ctx.fillStyle = "#ffffff";
        ctx.font = '20px Georgia, "Times New Roman", serif';
        ctx.fillText(item.sub1, x, y + 38);
        ctx.fillStyle = "#dddddd";
        ctx.font = 'italic 18px Georgia, "Times New Roman", serif';
        ctx.fillText(item.sub2, x, y + 62);
      };

      const drawCallout = (
        item: any,
        x: number,
        y: number,
        align: "left" | "right",
      ) => {
        ctx.textAlign = align;
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#ffffff";
        ctx.font = 'bold 42px Georgia, "Times New Roman", serif';
        ctx.fillText(item.accent, x, y);
        ctx.fillStyle = selectedTheme.accentColor;
        ctx.font = 'bold italic 42px Georgia, "Times New Roman", serif';
        ctx.fillText(item.title, x, y + 44);
        ctx.fillStyle = "#ffffff";
        ctx.font = 'italic 19px Georgia, "Times New Roman", serif';
        ctx.fillText(`— ${item.sub1} —`, x, y + 96);
      };

      const drawRibbon = (item: any, by: number, align: "left" | "right") => {
        ctx.textAlign = align;
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.fillStyle = selectedTheme.accentColor;

        if (align === "right") {
          ctx.fillRect(targetWidth - 420, by, 420, 50);
          ctx.shadowColor = "transparent";
          ctx.fillStyle = "#ffffff";
          ctx.font = 'bold 36px Georgia, "Times New Roman", serif';
          ctx.fillText(
            `${item.accent} ${item.title}`,
            targetWidth - 40,
            by + 6,
          );
          ctx.shadowColor = "rgba(0,0,0,0.7)";
          ctx.fillStyle = "#ffffff";
          ctx.font = '20px Georgia, "Times New Roman", serif';
          ctx.fillText(item.sub1, targetWidth - 40, by + 60);
          ctx.fillStyle = "#dddddd";
          ctx.font = 'italic 17px Georgia, "Times New Roman", serif';
          ctx.fillText(item.sub2, targetWidth - 40, by + 84);
        } else {
          ctx.fillRect(0, by, 420, 50);
          ctx.shadowColor = "transparent";
          ctx.fillStyle = "#ffffff";
          ctx.font = 'bold 36px Georgia, "Times New Roman", serif';
          ctx.fillText(`${item.accent} ${item.title}`, 40, by + 6);
          ctx.shadowColor = "rgba(0,0,0,0.7)";
          ctx.fillStyle = "#ffffff";
          ctx.font = '20px Georgia, "Times New Roman", serif';
          ctx.fillText(item.sub1, 40, by + 60);
          ctx.fillStyle = "#dddddd";
          ctx.font = 'italic 17px Georgia, "Times New Roman", serif';
          ctx.fillText(item.sub2, 40, by + 84);
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

      // [4] バーコード画像の描画
      if (barcodeImage) {
        const boxWidth = 105;
        const boxHeight =
          boxWidth * (barcodeImage.naturalHeight / barcodeImage.naturalWidth);

        let barcodeX = 40;
        let barcodeY = targetHeight - boxHeight - 30;
        if (layoutPattern === 1 || layoutPattern === 3) {
          barcodeX = targetWidth - boxWidth - 40;
        }

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 10;
        ctx.drawImage(barcodeImage, barcodeX, barcodeY, boxWidth, boxHeight);
        ctx.restore();
      }
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
    barcodeImage,
  ]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = async () => {
    if (!canvasRef.current) return;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvasRef.current!.toBlob(resolve, "image/png", 1.0)
    );
    if (!blob) return;

    const file = new File([blob], `fish-magazine-cover-${Date.now()}.png`, { type: "image/png" });

    // モバイル端末でShare APIが使える場合はシェアシート経由で「画像を保存」を提供
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    if (isMobile && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch {
        // キャンセルされた場合は何もしない
        return;
      }
    }

    // フォールバック: 通常のダウンロード
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = file.name;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
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
            釣り雑誌の表紙風画像ジェネレーター
          </h1>
        </div>
      </header>

      {/* iOS Safari: ホーム画面追加の誘導バナー */}
      {showInstallBanner && (
        <div className="bg-indigo-950/80 backdrop-blur-sm border-b border-indigo-500/20 animate-fade-in">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <p className="text-xs text-indigo-200 flex-1">
              <Share className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
              下部の共有ボタンから「ホーム画面に追加」でアプリとして使えます
            </p>
            <button onClick={dismissInstallBanner} className="text-indigo-400 hover:text-white shrink-0 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* アップロード前: 中央配置のアップロードエリア */}
        {!imageSrc && (
          <div className="flex flex-col items-center animate-fade-in-up">
            <label className="group relative flex flex-col items-center justify-center w-full max-w-md aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-600/60 hover:border-indigo-400/50 bg-slate-800/20 hover:bg-indigo-950/20 cursor-pointer transition-all duration-300">
              <div className="flex flex-col items-center gap-4 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white mb-1">
                    釣果写真をアップロード
                  </p>
                </div>
                <span className="text-xs text-slate-600 mt-2">
                  JPG / PNG / WebP / HEIC
                </span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg, image/png, image/webp, image/heic, image/heif, .heic, .heif"
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
