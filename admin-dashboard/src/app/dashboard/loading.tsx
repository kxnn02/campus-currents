export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Quick Action Cards skeleton */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[140px] rounded-lg bg-[#C4C5D5]/20" />
        ))}
      </div>
      {/* Stats Row skeleton */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[82px] rounded border border-[#C4C5D5]/50 bg-white p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#C4C5D5]/30" />
              <div className="space-y-2">
                <div className="h-3 w-32 rounded bg-[#C4C5D5]/30" />
                <div className="h-5 w-16 rounded bg-[#C4C5D5]/30" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="rounded-lg border border-[#C4C5D5]/50 bg-white overflow-hidden">
        <div className="h-14 border-b border-[#C4C5D5]/50 px-4 flex items-center">
          <div className="h-4 w-40 rounded bg-[#C4C5D5]/30" />
        </div>
        <div className="h-10 bg-[#FFF1F1]/50 border-b border-[#C4C5D5]/30" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 border-b border-[#C4C5D5]/20 px-4 flex items-center gap-4">
            <div className="h-5 w-16 rounded bg-[#C4C5D5]/20" />
            <div className="h-4 w-48 rounded bg-[#C4C5D5]/20" />
            <div className="h-4 w-24 rounded bg-[#C4C5D5]/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
