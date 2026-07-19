export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-24 rounded bg-[#C4C5D5]/30" />
        <div className="h-4 w-64 rounded bg-[#C4C5D5]/20" />
      </div>
      <div className="h-40 rounded-lg border border-[#C4C5D5]/50 bg-white" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-lg border border-[#C4C5D5]/50 bg-white" />
        ))}
      </div>
      <div className="h-72 rounded-lg border border-[#C4C5D5]/50 bg-white" />
    </div>
  );
}
