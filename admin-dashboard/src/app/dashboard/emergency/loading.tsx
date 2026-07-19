export default function EmergencyLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-52 rounded bg-[#C4C5D5]/30" />
          <div className="h-4 w-72 rounded bg-[#C4C5D5]/20" />
        </div>
        <div className="h-9 w-40 rounded-lg bg-[#C4C5D5]/30" />
      </div>
      <div className="h-40 rounded-xl border border-[#C4C5D5]/50 bg-white" />
    </div>
  );
}
