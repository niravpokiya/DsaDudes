import React, { useEffect, useState } from "react";
import { user_submissions_stats } from "../../utils/submission-apis";

const formatCompactCount = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const ProfileDifficultyGraph = () => {
  const [userStats, setUserStats] = useState({
    totalSubmissions: 0,
    solvedCount: 0,
    easySolvedCount: 0,
    mediumSolvedCount: 0,
    hardSolvedCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await user_submissions_stats();

        setUserStats(res.data || {});
      } catch (err) {
        console.error("Error fetching user stats:", err);
      }
    };

    fetchStats();
  }, []);

  const easySolvedCount = userStats.easySolved || 0;
  const mediumSolvedCount = userStats.mediumSolved || 0;
  const hardSolvedCount = userStats.hardSolved || 0;

  const totalSolved =easySolvedCount + mediumSolvedCount + hardSolvedCount;

  const totalSubmissions =
    userStats.totalSubmissions || 0;

  const acceptanceRate =
    totalSubmissions > 0
      ? (totalSolved / totalSubmissions) * 100
      : 0;

  const segments = [
    {
      label: "Easy",
      value: easySolvedCount,
      color: "#2dd4bf",
      trackColor: "rgba(45, 212, 191, 0.22)",
    },
    {
      label: "Med.",
      value: mediumSolvedCount,
      color: "#fbbf24",
      trackColor: "rgba(251, 191, 36, 0.22)",
    },
    {
      label: "Hard",
      value: hardSolvedCount,
      color: "#ef4444",
      trackColor: "rgba(239, 68, 68, 0.22)",
    },
  ];

  const fallbackSegments = [24, 38, 18];

  const activeSegments =
    totalSolved > 0
      ? segments.map((segment) => ({
          ...segment,
          percent:
            (segment.value / totalSolved) * 100,
        }))
      : segments.map((segment, index) => ({
          ...segment,
          percent: fallbackSegments[index],
        }));

  const startOffset = 12;

  let accumulatedPercent = startOffset;

  const arcStops = activeSegments.map(
    (segment) => {
      const start = accumulatedPercent;
      const end = start + segment.percent;
      accumulatedPercent = end + 4;

      return `${segment.color} ${start}% ${end}%`;
    },
  );

  return (
    <div className="rounded-[18px] border border-zinc-800/80 bg-zinc-950/40 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_132px] lg:items-center">
        <div className="relative mx-auto flex min-h-[190px] w-full max-w-[260px] items-center justify-center">
          <div
            className="absolute inset-[14px] rounded-full"
            style={{
              background: `conic-gradient(${arcStops.join(
                ", ",
              )}, rgba(255,255,255,0.04) ${accumulatedPercent}%, rgba(255,255,255,0.04) 100%)`,
              mask: "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 8px))",
              WebkitMask:
                "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 8px))",
            }}
          />

          <div className="absolute inset-[26px] rounded-full border border-white/5 bg-[#171723] shadow-inner" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.45em] text-zinc-500">
              Acceptance
            </div>

            <div className="mt-4 flex items-start justify-center gap-0.5 text-white">
              <span className="text-5xl font-semibold leading-none tracking-tight">
                {acceptanceRate.toFixed(2)}
              </span>

              <span className="pt-2 text-2xl font-semibold leading-none text-zinc-300">
                %
              </span>
            </div>

            <div className="mt-4 text-sm font-medium text-zinc-300">
              {totalSolved > 0
                ? `${formatCompactCount(
                    totalSolved,
                  )} solved`
                : "0 solved"}
            </div>

            <div className="mt-1 text-xs text-zinc-500">
              {totalSubmissions > 0
                ? `${formatCompactCount(
                    totalSubmissions,
                  )} submissions`
                : "submissions pending"}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-row gap-3 lg:flex-col lg:justify-center">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className="flex-1 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-3 text-center shadow-sm lg:flex-none"
            >
              <div
                className="text-sm font-semibold"
                style={{
                  color: segment.color,
                }}
              >
                {segment.label}
              </div>

              <div className="mt-1 text-lg font-bold text-white">
                {formatCompactCount(segment.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileDifficultyGraph;