export default function Stopwatch({ referralCount }: { referralCount: number }) {
  const earned = Math.min(Math.floor((referralCount / 20) * 300), 300);
  return (
    <div className="relative group flex flex-col items-center">
      {/* Dynamic Glow Effect */}
      <div className="absolute -inset-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full opacity-35 blur-md group-hover:opacity-60 transition-all duration-300"></div>
      
      {/* Main Bubble Circle */}
      <div className="relative bg-gradient-to-br from-amber-600 to-orange-700 text-white flex flex-col items-center justify-center w-40 h-40 rounded-full shadow-2xl transition-all duration-300 transform group-hover:scale-105 active:scale-95 border-2 border-white/20">
        <span className="text-[10px] font-bold opacity-75 uppercase tracking-wider mb-0.5">Earned</span>
        <span className="text-3xl font-black tracking-tight">R{earned}</span>
        <span className="text-[10px] opacity-85 font-medium border-t border-white/20 mt-1 pt-1">
          {referralCount} / 20 refs
        </span>
      </div>

      {/* Pill Button overlaying bottom edge */}
      <div className="absolute -bottom-3 bg-white hover:bg-stone-50 text-amber-700 text-[10px] font-black px-3.5 py-1 rounded-full shadow-md border border-stone-200 transition-all cursor-pointer">
        Topup R10
      </div>
    </div>
  );
}
