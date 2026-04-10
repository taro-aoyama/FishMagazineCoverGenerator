import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadCloud, Download, Loader2, Image as ImageIcon, LayoutTemplate, Move, ZoomIn } from 'lucide-react';
// @ts-ignore
import { Fish as FishIcon } from 'lucide-react';
import { removeBackground, Config } from '@imgly/background-removal';

const THEMES = [
  { id: 'general', name: '釣り（総合）', bgColor: '#cfc4b6', accentColor: '#c0392b', title: "HOOK & TACKLE" },
  { id: 'bass', name: 'ブラックバス系', bgColor: '#97a292', accentColor: '#d35400', title: "BASS STRIKE" },
  { id: 'trout', name: 'トラウト系', bgColor: '#d8ab8a', accentColor: '#2c3e50', title: "TROUT & STREAM" },
  { id: 'shore', name: 'ソルトウォーター（ショア）', bgColor: '#c3c6b8', accentColor: '#2980b9', title: "SALT ANGLER" },
  { id: 'offshore', name: 'ソルトウォーター（オフショア）', bgColor: '#899fb2', accentColor: '#e74c3c', title: "OCEAN GAME" },
];

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  // AI状態
  const [workerStatus, setWorkerStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [progressMsg, setProgressMsg] = useState<string>('');
  
  // キャンバス・画像状態
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState<number>(0.95);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('general');
  
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [personFishImage, setPersonFishImage] = useState<HTMLImageElement | null>(null);

  const selectedTheme = THEMES.find(t => t.id === selectedThemeId) || THEMES[0];

  // 画像アップロード処理
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setImageSrc(event.target.result);
          setWorkerStatus('idle');
          setPersonFishImage(null);
          setScale(1.0);
          setOffsetY(0);
          setProgressMsg('');
          
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
    setWorkerStatus('processing');
    setProgressMsg('魔法の前景抽出を実行中...');
    
    try {
      // @imgly による背景透過抽出
      const config: Config = {
        progress: (key, current, total) => {
          if (key.includes('fetch')) setProgressMsg('モデルをダウンロード/ロード中...');
          if (key.includes('compute')) setProgressMsg('画像を解析し、人物と魚を綺麗に切り抜いています...');
        }
      };

      const imageBlob = await removeBackground(imageSrc, config);
      const url = URL.createObjectURL(imageBlob);
      
      const fgImg = new Image();
      fgImg.onload = () => {
        setPersonFishImage(fgImg);
        setWorkerStatus('complete');
      };
      fgImg.src = url;

    } catch (error: any) {
      console.error(error);
      setWorkerStatus('error');
      setProgressMsg(error?.message || '抽出中にエラーが発生しました');
    }
  };

  const drawBarcode = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, 120, 60);
    ctx.fillStyle = '#000';
    for(let i=0; i<30; i++) {
        const thickness = Math.random() * 4 + 1;
        const gap = Math.random() * 4 + 2;
        ctx.fillRect(x + 5 + i*(thickness+gap), y + 5, thickness, 40);
        if (x + 5 + i*(thickness+gap) > x + 110) break;
    }
    ctx.font = 'bold 12px monospace';
    ctx.fillText('978-4-06-258273-0', x + 5, y + 55);
  };

  // 雑誌風レイアウト描画
  const drawCanvas = useCallback(() => {
    if (!originalImage || !canvasRef.current || !imageSrc) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
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
    canvas.style.maxWidth = '600px';
    canvas.style.aspectRatio = `${targetWidth}/${targetHeight}`;
    canvas.style.height = 'auto';

    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // 1. 背景の描画 (レトロカラーのソリッド背景)
    ctx.fillStyle = selectedTheme.bgColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#000';
    for (let i = 0; i < 5000; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * targetWidth, Math.random() * targetHeight, Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // 2. 巨大なタイトルロゴを描画（前景の「後ろ」）
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.font = '900 130px Impact, "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    
    // Canvasの第4引数 (maxWidth=740px) を指定し、どんなに長いタイトルでも絶対に左右30pxの余白内に縮小して収める
    ctx.fillText(selectedTheme.title, targetWidth / 2, 50, targetWidth - 60);
    ctx.shadowColor = 'transparent';

    // 3. その他背面のヘッダーテキスト
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Courier New", Courier, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('EST. 1968 | VOL.34 / SPECIAL ISSUE', 40, 25);

    // 4. 前景（人物＋魚）の描画（タイトルロゴの上に乗せる立体感）
    if (workerStatus === 'complete' && personFishImage) {
        ctx.save();
        
        // 良い感じのドロップシャドウで雑誌の切り抜きっぽさを演出
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 20;

        // 前景画像を全体としてスケーリング
        const baseHeight = targetHeight * 0.85; // デフォルトで画面の85%の高さ
        const drawHeight = baseHeight * scale;
        const drawWidth = drawHeight * (personFishImage.width / personFishImage.height);
        
        const drawX = (targetWidth - drawWidth) / 2;
        // 基本は下揃えにしつつ、offsetYで微調整
        const drawY = (targetHeight - drawHeight) + offsetY;
        
        ctx.drawImage(personFishImage, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
    } else {
        // 未加工時は元の写真をとりあえず真ん中に置く（UIプレビュー用）
        ctx.save();
        const baseScale = Math.min(targetWidth / originalImage.width, targetHeight / originalImage.height) * 0.9;
        const w = originalImage.width * baseScale;
        const h = originalImage.height * baseScale;
        ctx.drawImage(originalImage, (targetWidth - w)/2, (targetHeight - h)/2, w, h);
        ctx.restore();
    }

    // 5. 雑誌の手前側にくるキャッチコピー等の描画
    if (workerStatus === 'complete') {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      
      // サイドの大見出し
      ctx.font = '900 60px Impact, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 10;
      
      ctx.fillText('SECRET', 40, targetHeight / 2 - 80);
      ctx.fillStyle = selectedTheme.accentColor;
      ctx.fillText('LOCATIONS', 40, targetHeight / 2 - 20);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Times New Roman", Times, serif';
      ctx.fillText('Expert Tackle Guide', 40, targetHeight / 2 + 30);
      ctx.fillText('Monster Tactics', 40, targetHeight / 2 + 65);

      // 右下の特集
      ctx.textAlign = 'right';
      ctx.font = 'italic 900 45px Impact, sans-serif';
      ctx.fillStyle = selectedTheme.accentColor;
      ctx.fillText('TROPHY', targetWidth - 40, targetHeight * 0.7);
      
      ctx.font = 'bold 22px "Times New Roman", Times, serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('The Ultimate Catch Of The Month', targetWidth - 40, targetHeight * 0.7 + 40);

      // バーコード
      drawBarcode(ctx, targetWidth - 160, targetHeight - 80);
    }

  }, [originalImage, personFishImage, scale, offsetY, selectedTheme, workerStatus, imageSrc]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `fishtale-magazine-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
  };

  const isWorking = workerStatus === 'processing';
  const isDone = workerStatus === 'complete';

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10 hero-gradient flex flex-col min-h-[95vh]">
        <header className="mb-10 text-center animate-fade-in-up">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/20">
              <LayoutTemplate className="w-8 h-8 text-white relative z-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 tracking-tight">
              釣り雑誌ジェネレーター
            </h1>
          </div>
          <p className="text-slate-400 text-lg md:text-xl font-light max-w-2xl mx-auto">
            プライバシー保護×SNS映え！<br/>あなたの釣果写真を「伝説の釣り雑誌の表紙」に自動合成します
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 items-start flex-1 w-full">
          {/* LEFT COLUMN: Preview Canvas */}
          <div className="lg:col-span-8 w-full flex flex-col items-center">
            <div className={`relative w-full rounded-2xl md:rounded-3xl border ${imageSrc ? 'border-slate-700/50 bg-[#111827]/60' : 'border-dashed border-slate-600 hover:border-indigo-400/60 hover:bg-indigo-900/10'} p-4 md:p-8 flex items-center justify-center overflow-hidden glass-panel group min-h-[600px]`}>
              {!imageSrc ? (
                 <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer absolute inset-0 z-10 transition-transform duration-300 group-hover:scale-[1.02]">
                 <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                   <UploadCloud className="w-16 h-16 text-indigo-400 mb-6 drop-shadow-lg" />
                   <h2 className="text-2xl font-bold text-white mb-2">写真をアップロード</h2>
                   <p className="text-slate-400 font-medium">※人物入り・横持ちの釣果写真が最適です</p>
                 </div>
                 <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} />
               </label>
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center animate-fade-in pointer-events-auto">
                  <div className="relative w-full flex justify-center">
                    <canvas ref={canvasRef} className="rounded-xl drop-shadow-2xl shadow-indigo-900/20" />
                    {isWorking && (
                      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md rounded-xl flex flex-col items-center justify-center z-20 transition-all border border-indigo-500/30">
                        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-6" />
                        <p className="text-xl font-bold text-white mb-2 tracking-wide">{progressMsg}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Controls Panel */}
          <div className="lg:col-span-4 w-full space-y-6 sticky top-8">
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-700/50 flex flex-col gap-6">
              
              <div className="pb-4 border-b border-slate-700/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                   <ImageIcon className="w-5 h-5 text-indigo-400" />表紙の作成
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">背景を隠して、釣果を主役にします。</p>
              </div>

              {!isDone ? (
                <div className="space-y-4 relative">
                  <button onClick={startExtraction} disabled={!imageSrc || isWorking} className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-xl overflow-hidden relative group ${!imageSrc ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50' : isWorking ? 'bg-indigo-600/50 text-white cursor-wait' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:shadow-indigo-500/30 border border-indigo-400/20'}`} >
                    {isWorking ? <Loader2 className="w-5 h-5 animate-spin" /> : <LayoutTemplate className="w-5 h-5 relative z-10" />}
                    <span className="relative z-10">{isWorking ? '抽出中...' : '背景を消して雑誌にする'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-300">雑誌のスタイルテーマ</label>
                    <div className="grid grid-cols-2 gap-2">
                       {THEMES.map(theme => (
                         <button key={theme.id} onClick={() => setSelectedThemeId(theme.id)} className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-2 ${selectedThemeId === theme.id ? 'bg-slate-800 border-indigo-400/80 shadow-lg shadow-indigo-500/20 text-white' : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:bg-slate-800'}`}>
                            <div className="w-full h-8 rounded-lg" style={{ background: theme.bgColor, border: `2px solid ${theme.accentColor}` }}></div>
                            {theme.name}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 space-y-5">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-3">
                        <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3 text-slate-500"/> サイズ</span>
                        <span className="text-indigo-300">{Math.round(scale * 100)}%</span>
                      </div>
                      <input type="range" min="0.5" max="2.0" step="0.05" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer hover:accent-indigo-400 transition-all outline-none" />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-3">
                        <span className="flex items-center gap-1"><Move className="w-3 h-3 text-slate-500"/> 上下位置</span>
                        <span className="text-indigo-300">{offsetY > 0 ? `+${offsetY}` : offsetY}px</span>
                      </div>
                      <input type="range" min="-300" max="300" step="10" value={offsetY} onChange={(e) => setOffsetY(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer hover:accent-indigo-400 transition-all outline-none" />
                    </div>
                  </div>

                  <button onClick={handleDownload} className="w-full py-4 rounded-xl bg-slate-100 hover:bg-white text-slate-900 font-bold transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2" >
                    <Download className="w-5 h-5" /> 表紙画像を保存
                  </button>
                  <button onClick={() => { setImageSrc(null); setWorkerStatus('idle'); setProgressMsg(''); }} className="w-full py-3 rounded-xl bg-transparent hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-medium transition-all text-sm border border-transparent hover:border-red-500/30" >
                    新しく作り直す
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
