export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-28 rounded bg-[#C4C5D5]/30" />
        <div className="h-4 w-56 rounded bg-[#C4C5D5]/20" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl border border-[#C4C5D5]/50 bg-white" />
        ))}
      </div>
      <div className="h-64 rounded-md border border-[#C4C5D5]/50 bg-white" />
    </div>
  );
}
