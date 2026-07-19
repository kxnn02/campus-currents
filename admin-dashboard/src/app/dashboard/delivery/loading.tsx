export default function DeliveryLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-44 rounded bg-[#C4C5D5]/30" />
          <div className="h-4 w-72 rounded bg-[#C4C5D5]/20" />
        </div>
        <div className="h-8 w-24 rounded-lg bg-[#C4C5D5]/20" />
      </div>
      <div className="h-52 rounded-lg border border-[#C4C5D5]/50 bg-white" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg border border-[#C4C5D5]/50 bg-white" />
        ))}
      </div>
    </div>
  );
}
