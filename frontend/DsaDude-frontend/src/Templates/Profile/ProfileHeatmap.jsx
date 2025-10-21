import React, { useMemo, useRef, useState } from 'react';

// Generate a 7x(weeks) grid ending today. Default 52 weeks.
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
  // group by week columns
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

const ProfileHeatmap = ({ activityByDate = {} }) => {
  // activityByDate is a map: 'YYYY-MM-DD' -> number
  const weeks = useMemo(() => generateCalendarWeeks(52), []);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });

  const getCount = (date) => {
    const key = date.toISOString().slice(0, 10);
    return activityByDate[key] || 0;
  };

  const showTooltip = (event, date, count) => {
    const key = date.toISOString().slice(0, 10);
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

  return (
    <div className="card" ref={containerRef} style={{ position: 'relative' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Submissions in the past year</h3>
        <div className="flex items-center gap-2 text-xs text-secondary">
          <span>Less</span>
          <div className="flex gap-1">
            {[0,1,2,3,4].map((lvl) => (
              <div key={lvl} className="w-3 h-3 rounded" style={{ background: intensityColor(lvl) }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto" style={{ paddingBottom: '0.25rem' }} onMouseMove={moveTooltip}>
        {weeks.map((column, cIdx) => (
          <div key={cIdx} className="flex flex-col gap-1">
            {column.map((day, dIdx) => {
              const count = getCount(day);
              const lvl = levelForCount(count);
              return (
                <div
                  key={dIdx}
                  onMouseEnter={(e) => showTooltip(e, day, count)}
                  onMouseLeave={hideTooltip}
                  className="w-3 h-3 rounded"
                  style={{ background: intensityColor(lvl), border: '1px solid var(--border-secondary)' }}
                />
              );
            })}
          </div>
        ))}
      </div>
      {tooltip.visible && (
        <div
          ref={tooltipRef}
          className="pointer-events-none text-xs px-2 py-1 rounded shadow"
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            whiteSpace: 'nowrap',
            zIndex: 10
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

function clampToBounds(pos, rect, tooltipRef) {
  const padding = 8;
  const containerWidth = rect ? rect.width : 300;
  const containerHeight = rect ? rect.height : 150;
  const tipW = tooltipRef?.current?.offsetWidth || 120;
  const tipH = tooltipRef?.current?.offsetHeight || 28;

  let x = pos.x;
  let y = pos.y;

  // If going beyond right edge, shift left by tooltip width
  if (x + tipW + padding > containerWidth) {
    x = Math.max(padding, containerWidth - tipW - padding);
  } else if (x < padding) {
    x = padding;
  }

  // If going above top, place below the cursor
  if (y < padding) {
    y = padding;
  }
  if (y + tipH + padding > containerHeight) {
    y = Math.max(padding, containerHeight - tipH - padding);
  }

  return { x, y };
}

function intensityColor(level) {
  switch (level) {
    case 1: return 'rgba(255, 161, 22, 0.25)';
    case 2: return 'rgba(255, 161, 22, 0.45)';
    case 3: return 'rgba(255, 161, 22, 0.65)';
    case 4: return 'rgba(255, 161, 22, 0.9)';
    default: return 'rgba(255, 255, 255, 0.06)';
  }
}

export default ProfileHeatmap;


