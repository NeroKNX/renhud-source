export function LoadingDots() {
  return (
    <div className="flex gap-1.5">
      <span className="w-2 h-2 rounded-full bg-[#818cf8] animate-pulse" />
      <span className="w-2 h-2 rounded-full bg-[#818cf8] animate-pulse" style={{ animationDelay: '0.2s' }} />
      <span className="w-2 h-2 rounded-full bg-[#818cf8] animate-pulse" style={{ animationDelay: '0.4s' }} />
    </div>
  );
}
