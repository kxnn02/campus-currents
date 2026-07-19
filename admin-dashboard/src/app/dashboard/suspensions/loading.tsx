export default function SuspensionsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded bg-[#C4C5D5]/30" />
          <div className="h-4 w-64 rounded bg-[#C4C5D5]/20" />
        </div>
        <div className="h-9 w-40 rounded-lg bg-[#C4C5D5]/30" />
      </div>
      <div className="rounded-md border border-[#C4C5D5]/50 bg-white overflow-hidden">
        <div className="h-10 bg-[#C4C5D5]/10 border-b" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 border-b border-[#C4C5D5]/20 px-4 flex items-center gap-4">
            <div className="h-4 w-24 rounded bg-[#C4C5D5]/20" />
            <div className="h-4 w-20 rounded bg-[#C4C5D5]/20" />
            <div className="h-4 w-28 rounded bg-[#C4C5D5]/20" />
            <div className="h-5 w-16 rounded bg-[#C4C5D5]/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
