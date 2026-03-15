import React from 'react';
import { motion } from 'motion/react';
import { Flame, Sparkles, Shield, Compass, Scroll, Target, Zap } from 'lucide-react';

const BronzePattern = () => (
  <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none" className="opacity-30">
    <path
      d="M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10"
      fill="none"
      stroke="#8C6A3B"
      strokeWidth="1"
    />
    <path
      d="M0 15 Q 12.5 5, 25 15 T 50 15 T 75 15 T 100 15"
      fill="none"
      stroke="#D4AF37"
      strokeWidth="0.5"
    />
  </svg>
);

const CloudMotif = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 60" className={className}>
    <path
      d="M10 40 Q 10 20, 30 20 Q 40 10, 60 20 Q 90 20, 90 40 Q 90 55, 70 55 L 30 55 Q 10 55, 10 40 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M25 45 Q 35 35, 50 45 T 75 45"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.5"
    />
  </svg>
);

export const StyleGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#D4AF37] font-serif p-8 md:p-16 overflow-hidden relative">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(140,106,59,0.05)_0%,transparent_70%)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-900/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="flex justify-center mb-4">
            <CloudMotif className="w-16 h-16 text-[#8C6A3B] opacity-50" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#8C6A3B] mb-4">
            羲光剧游
          </h1>
          <p className="text-xl tracking-[0.5em] uppercase opacity-60 font-sans">
            Xiguang Juyou · Visual Style Guide
          </p>
          <div className="mt-8 max-w-xl mx-auto">
            <BronzePattern />
          </div>
        </motion.div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto space-y-32">
        {/* Section: Color Palette */}
        <section>
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8C6A3B] to-transparent" />
            <h2 className="text-2xl font-bold uppercase tracking-widest">色彩矩陣</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8C6A3B] to-transparent" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Deep Night', hex: '#0B0D12', desc: '主背景色，深邃靜謐' },
              { name: 'Ancient Bronze', hex: '#8C6A3B', desc: '器物本色，沉穩厚重' },
              { name: 'Dark Gold', hex: '#D4AF37', desc: '裝飾輔色，歲月留痕' },
              { name: 'Warm Gold', hex: '#FFD700', desc: '高光點綴，神性覺醒' },
            ].map((color) => (
              <motion.div
                key={color.hex}
                whileHover={{ y: -5 }}
                className="bg-[#161920] border border-[#8C6A3B]/30 p-4 rounded-2xl shadow-2xl"
              >
                <div
                  className="h-32 rounded-xl mb-4 shadow-inner"
                  style={{ backgroundColor: color.hex }}
                />
                <h3 className="font-bold text-lg mb-1">{color.name}</h3>
                <code className="text-xs opacity-50 block mb-2">{color.hex}</code>
                <p className="text-xs opacity-70 font-sans leading-relaxed">{color.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section: UI Components */}
        <section>
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8C6A3B] to-transparent" />
            <h2 className="text-2xl font-bold uppercase tracking-widest">器物交互</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8C6A3B] to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Buttons */}
            <div className="space-y-8">
              <h3 className="text-sm uppercase tracking-widest opacity-50 mb-6 border-l-2 border-[#8C6A3B] pl-4">交互按鈕</h3>
              <div className="flex flex-wrap gap-6">
                <button className="relative group px-8 py-3 overflow-hidden">
                  <div className="absolute inset-0 border border-[#FFD700]/50 rounded-lg group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 font-bold tracking-widest">啟動機制</span>
                </button>

                <button className="relative px-8 py-3 bg-[#8C6A3B] text-[#0B0D12] font-black rounded-lg shadow-[0_0_20px_rgba(140,106,59,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all">
                  儀式開始
                </button>

                <button className="flex items-center gap-2 border-b border-[#8C6A3B] pb-1 hover:text-[#FFD700] transition-colors">
                  <Scroll size={16} />
                  <span className="text-sm tracking-widest">查閱卷軸</span>
                </button>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-8">
              <h3 className="text-sm uppercase tracking-widest opacity-50 mb-6 border-l-2 border-[#8C6A3B] pl-4">資訊載體</h3>
              <div className="bg-[#161920] border-2 border-[#8C6A3B]/40 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                  <CloudMotif className="w-12 h-12" />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#8C6A3B]/20 rounded-xl flex items-center justify-center mb-4 border border-[#8C6A3B]/30">
                    <Shield className="text-[#FFD700]" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">青銅銘文</h4>
                  <p className="text-sm opacity-60 font-sans leading-relaxed">
                    古老的文字刻於青銅之上，記錄著文明的興衰與神祇的低語。
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Section: Lighting & Effects */}
        <section>
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8C6A3B] to-transparent" />
            <h2 className="text-2xl font-bold uppercase tracking-widest">光影神韻</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8C6A3B] to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Flame Animation */}
            <div className="flex flex-col items-center justify-center p-8 bg-[#161920] rounded-3xl border border-[#8C6A3B]/20">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6],
                  filter: ['blur(0px)', 'blur(4px)', 'blur(0px)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <Flame size={64} className="text-[#FFD700] filter drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" />
              </motion.div>
              <p className="mt-6 text-sm tracking-widest opacity-50 uppercase">文明之火</p>
            </div>

            {/* Spark Effects */}
            <div className="flex flex-col items-center justify-center p-8 bg-[#161920] rounded-3xl border border-[#8C6A3B]/20 relative overflow-hidden">
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-[#FFD700] rounded-full"
                    initial={{ x: "50%", y: "50%", opacity: 0 }}
                    animate={{ 
                      x: `${50 + (Math.random() - 0.5) * 100}%`,
                      y: `${50 + (Math.random() - 0.5) * 100}%`,
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 1 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>
              <Sparkles size={48} className="text-[#D4AF37] relative z-10" />
              <p className="mt-6 text-sm tracking-widest opacity-50 uppercase">靈光乍現</p>
            </div>

            {/* Mechanism Activation */}
            <div className="flex flex-col items-center justify-center p-8 bg-[#161920] rounded-3xl border border-[#8C6A3B]/20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Compass size={64} className="text-[#8C6A3B]" />
                <motion.div
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 border-2 border-[#FFD700] rounded-full scale-125"
                />
              </motion.div>
              <p className="mt-6 text-sm tracking-widest opacity-50 uppercase">機關運轉</p>
            </div>
          </div>
        </section>

        {/* Section: Typography */}
        <section className="pb-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8C6A3B] to-transparent" />
            <h2 className="text-2xl font-bold uppercase tracking-widest">字體風骨</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8C6A3B] to-transparent" />
          </div>
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-6xl font-black text-[#FFD700]">文明覺醒</p>
                <p className="text-sm opacity-50">Display Serif · Bold / Black</p>
              </div>
              <div className="space-y-4">
                <p className="text-xl leading-relaxed opacity-80">
                  在深邃的黑夜中，青銅的鳴響穿透時空。每一處刻痕都隱藏著一段被遺忘的歷史，等待著有緣人的觸碰與解讀。
                </p>
                <p className="text-sm opacity-50">Body Serif · Regular / 1.6 Line Height</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Decorative Corners */}
      <div className="fixed top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-[#8C6A3B]/20 pointer-events-none m-4" />
      <div className="fixed top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-[#8C6A3B]/20 pointer-events-none m-4" />
      <div className="fixed bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-[#8C6A3B]/20 pointer-events-none m-4" />
      <div className="fixed bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-[#8C6A3B]/20 pointer-events-none m-4" />
      
      <footer className="relative z-10 text-center py-12 border-t border-[#8C6A3B]/10">
        <p className="text-xs tracking-[1em] uppercase opacity-30">
          Ancient Wisdom · Modern Vision
        </p>
      </footer>
    </div>
  );
};
