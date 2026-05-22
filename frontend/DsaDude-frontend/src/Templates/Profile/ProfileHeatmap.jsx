import React, { useMemo, useRef, useState, useEffect } from "react";

function generateCalendarWeeks(weeks = 52) {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = weeks * 7;

  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    cells.push(d);
  }

  const cols = [];
  for (let i = 0; i < cells.length; i += 7) {
    cols.push(cells.slice(i, i + 7));
  }
  return cols;
}

function levelForCount(count) {
  if (!count || count <= 0) return 0;
  if (count < 2) return 1;
  if (count < 4) return 2;
  if (count < 7) return 3;
  return 4;
}

function intensityColor(level) {
  switch (level) {
    case 1: return "rgba(255, 161, 22, 0.25)";
    case 2: return "rgba(255, 161, 22, 0.45)";
    case 3: return "rgba(255, 161, 22, 0.65)";
    case 4: return "rgba(255, 161, 22, 0.9)";
    default: return "rgba(255, 255, 255, 0.04)";
  }
}

function clampToBounds(pos, containerRect, tooltipRef) {
  if (!containerRect || !tooltipRef.current) return pos;
  const tooltipWidth = tooltipRef.current.offsetWidth;
  const tooltipHeight = tooltipRef.current.offsetHeight;

  let x = pos.x;
  let y = pos.y;

  if (x + tooltipWidth > containerRect.width) x = containerRect.width - tooltipWidth - 4;
  if (y + tooltipHeight > containerRect.height) y = containerRect.height - tooltipHeight - 4;
  if (x < 0) x = 4;
  if (y < 0) y = 4;

  return { x, y };
}

const ProfileHeatmap = ({ userId }) => {
  const weeks = useMemo(() => generateCalendarWeeks(52), []);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [activityByDate, setActivityByDate] = useState({});
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: "" });

  useEffect(() => {
    const fetchHeatmap = async () => {
      setLoading(true);
      try {
        console.log("printing type of : ", typeof userId, userId);
        const res = await fetch(`http://localhost:8080/api/submissions/heatmap?userId=${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setActivityByDate(data);
      } catch (err) {
        console.error("Heatmap fetch failed", err);
      }
      setLoading(false);
    };
    if (userId) fetchHeatmap();
  }, [userId]);

  const getCount = (date) => {
    const key = date.toLocaleDateString("en-CA");
    return activityByDate[key] || 0;
  };

  const showTooltip = (event, date, count) => {
    const key = date.toLocaleDateString("en-CA");
    const rect = containerRef.current?.getBoundingClientRect();
    const offsetX = rect ? event.clientX - rect.left : event.clientX;
    const offsetY = rect ? event.clientY - rect.top : event.clientY;

    const next = clampToBounds({ x: offsetX + 8, y: offsetY - 28 }, rect, tooltipRef);
    setTooltip({ visible: true, x: next.x, y: next.y, text: `${key} • ${count} submissions` });
  };

  const moveTooltip = (event) => {
    if (!tooltip.visible) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const offsetX = rect ? event.clientX - rect.left : event.clientX;
    const offsetY = rect ? event.clientY - rect.top : event.clientY;

    const next = clampToBounds({ x: offsetX + 8, y: offsetY - 28 }, rect, tooltipRef);
    setTooltip((t) => ({ ...t, x: next.x, y: next.y }));
  };

  const hideTooltip = () => setTooltip((t) => ({ ...t, visible: false }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Dynamic Heatmap Info Bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-zinc-400">Activity Overview</span>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((lvl) => (
              <div key={lvl} className="w-3 h-3 rounded-sm" style={{ background: intensityColor(lvl) }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Grid container with custom invisible scroll utility */}
      <div
        className="flex gap-1 overflow-x-auto no-scrollbar"
        style={{ paddingBottom: "0.25rem", width: "100%" }}
        onMouseMove={moveTooltip}
      >
        {weeks.map((column, cIdx) => (
          <div key={cIdx} className="flex flex-col gap-1 flex-shrink-0">
            {column.map((day, dIdx) => {
              const count = getCount(day);
              const lvl = levelForCount(count);

              return (
                <div
                  key={dIdx}
                  onMouseEnter={(e) => showTooltip(e, day, count)}
                  onMouseLeave={hideTooltip}
                  className="w-[11px] h-[11px] rounded-sm transition-colors duration-150"
                  style={{
                    background: intensityColor(lvl),
                    border: "1px solid rgba(255,255,255,0.03)",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {tooltip.visible && (
        <div
          ref={tooltipRef}
          className="pointer-events-none text-xs px-2 py-1 rounded-md shadow-xl bg-zinc-900 border border-zinc-800 text-zinc-200"
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {tooltip.text}
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ProfileHeatmap;