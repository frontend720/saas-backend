const Pulse = ({ className = '' }) => (
  <div className={`animate-pulse bg-[#111111]/8 ${className}`} />
);

export const CapsuleCardSkeleton = () => (
  <div className="border border-[#111111]/20 bg-white flex flex-col h-64">
    <div className="flex-1 border-b border-[#111111]/20 bg-[#F9F9F9]">
      <Pulse className="w-full h-full" />
    </div>
    <div className="p-4 space-y-2">
      <Pulse className="h-4 w-3/4" />
      <div className="flex justify-between mt-2">
        <Pulse className="h-3 w-20" />
        <Pulse className="h-3 w-12" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <CapsuleCardSkeleton key={i} />
    ))}
  </div>
);

export const AssetCardSkeleton = () => (
  <div className="border border-[#111111]/20 bg-white flex flex-col h-48">
    <div className="flex-1 border-b border-[#111111]/20 bg-[#F9F9F9]">
      <Pulse className="w-full h-full" />
    </div>
    <div className="p-3 space-y-2">
      <Pulse className="h-3 w-5/6" />
      <Pulse className="h-2 w-1/2" />
    </div>
  </div>
);

export const ProjectSkeleton = () => (
  <div className="min-h-screen bg-[#F9F9F9]">
    <div className="h-16 border-b border-[#111111]/20 px-4 lg:px-12 flex items-center gap-3 bg-white">
      <Pulse className="w-5 h-5 rounded" />
      <div className="space-y-1.5">
        <Pulse className="h-2.5 w-32" />
        <Pulse className="h-4 w-48" />
      </div>
    </div>
    <div className="px-6 lg:px-12 py-8 border-b border-[#111111]/20 bg-white">
      <div className="flex gap-8">
        <div className="space-y-1.5">
          <Pulse className="h-2.5 w-12" />
          <Pulse className="h-4 w-16" />
        </div>
        <div className="space-y-1.5">
          <Pulse className="h-2.5 w-12" />
          <Pulse className="h-4 w-8" />
        </div>
      </div>
    </div>
    <div className="px-6 lg:px-12 py-8">
      <Pulse className="h-7 w-24 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <AssetCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

export const SettingsSkeleton = () => (
  <div className="min-h-screen bg-[#F9F9F9]">
    <div className="h-20 border-b border-[#111111]/20 px-6 lg:px-12 flex items-center bg-white">
      <div className="space-y-1.5">
        <Pulse className="h-2.5 w-24" />
        <Pulse className="h-5 w-36" />
      </div>
    </div>
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border border-[#111111]/20 bg-white p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Pulse className="w-5 h-5" />
            <Pulse className="h-5 w-28" />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Pulse className="h-3 w-16" />
              <Pulse className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <Pulse className="h-3 w-20" />
              <Pulse className="h-11 w-full" />
            </div>
          </div>
          <Pulse className="h-11 w-36" />
        </div>
      ))}
    </div>
  </div>
);
