import React, { useMemo } from "react";

const SERIES = [
  { key: 1, label: "Registered Users", color: "#4285F4" },
  { key: 2, label: "Cms", color: "#DB4437" },
  { key: 3, label: "Order", color: "#F4B400" },
  { key: 4, label: "Payment", color: "#0F9D58" },
];

/**
 * Lightweight SVG chart — avoids Google Charts loader/locale crashes.
 * rows: [[month, users, cms, order, payment], ...]
 */
const DashboardChart = ({ rows = [], narrow = false }) => {
  const { ticks, paths, bars, labels, viewH } = useMemo(() => {
    const safe = Array.isArray(rows) ? rows : [];
    let peak = 1;
    safe.forEach((row) => {
      for (let i = 1; i <= 4; i += 1) {
        const n = Number(row?.[i]) || 0;
        if (n > peak) peak = n;
      }
    });
    peak = Math.max(1, Math.ceil(peak));

    const tickCount = 5;
    const step = Math.max(1, Math.ceil(peak / (tickCount - 1)));
    const yMax = step * (tickCount - 1);
    const yTicks = Array.from({ length: tickCount }, (_, i) => i * step);

    const W = 1000;
    const H = narrow ? 320 : 400;
    const pad = { top: 16, right: 16, bottom: narrow ? 48 : 40, left: 40 };
    const innerW = W - pad.left - pad.right;
    const innerH = H - pad.top - pad.bottom;
    const n = Math.max(safe.length, 1);
    const xAt = (i) => pad.left + (innerW * (i + 0.5)) / n;
    const yAt = (v) => pad.top + innerH * (1 - (Number(v) || 0) / yMax);

    const linePaths = SERIES.map((s) => {
      const d = safe
        .map((row, i) => {
          const x = xAt(i);
          const y = yAt(row?.[s.key]);
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
      const points = safe.map((row, i) => ({
        x: xAt(i),
        y: yAt(row?.[s.key]),
        value: Number(row?.[s.key]) || 0,
        month: row?.[0] ?? "",
      }));
      return { ...s, d, points };
    });

    const groupW = innerW / n;
    const barCluster = groupW * 0.72;
    const barW = barCluster / SERIES.length;
    const columnBars = safe.flatMap((row, i) => {
      const groupX = pad.left + groupW * i + (groupW - barCluster) / 2;
      return SERIES.map((s, si) => {
        const value = Number(row?.[s.key]) || 0;
        const y = yAt(value);
        const h = pad.top + innerH - y;
        return {
          key: `${i}-${s.key}`,
          x: groupX + si * barW,
          y,
          width: Math.max(barW - 2, 2),
          height: Math.max(h, 0),
          color: s.color,
          label: `${s.label}: ${value}`,
        };
      });
    });

    const monthLabels = safe.map((row, i) => ({
      x: xAt(i),
      text: String(row?.[0] ?? ""),
      show: !narrow || i % 2 === 0 || i === safe.length - 1,
    }));

    return {
      ticks: yTicks.map((t) => ({
        value: t,
        y: yAt(t),
      })),
      paths: linePaths,
      bars: columnBars,
      labels: monthLabels,
      viewH: H,
    };
  }, [rows, narrow]);

  if (!rows?.length) {
    return <div className="dashboard-chart__loader">Loading chart…</div>;
  }

  return (
    <div className="dashboard-chart__svg-wrap">
      <svg
        className="dashboard-chart__svg"
        viewBox={`0 0 1000 ${viewH}`}
        role="img"
        aria-label="Dashboard metrics by month"
      >
        {ticks.map((t) => (
          <g key={t.value}>
            <line
              x1={40}
              x2={984}
              y1={t.y}
              y2={t.y}
              className="dashboard-chart__grid"
            />
            <text x={32} y={t.y + 4} className="dashboard-chart__tick" textAnchor="end">
              {t.value}
            </text>
          </g>
        ))}

        {narrow
          ? paths.map((series) => (
              <g key={series.key}>
                <path
                  d={series.d}
                  fill="none"
                  stroke={series.color}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {series.points.map((p, i) => (
                  <circle
                    key={`${series.key}-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={3.5}
                    fill={series.color}
                  >
                    <title>
                      {p.month} — {series.label}: {p.value}
                    </title>
                  </circle>
                ))}
              </g>
            ))
          : bars.map((bar) => (
              <rect
                key={bar.key}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={bar.color}
                rx={1.5}
              >
                <title>{bar.label}</title>
              </rect>
            ))}

        {labels.map((label, i) =>
          label.show ? (
            <text
              key={`${label.text}-${i}`}
              x={label.x}
              y={viewH - 14}
              className="dashboard-chart__label"
              textAnchor="middle"
            >
              {label.text}
            </text>
          ) : null
        )}
      </svg>

      <ul className="dashboard-chart__legend">
        {SERIES.map((s) => (
          <li key={s.key}>
            <span style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardChart;
