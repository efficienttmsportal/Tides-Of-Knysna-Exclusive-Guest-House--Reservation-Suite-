import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Calendar, TrendingUp, DollarSign, Award, Target, ArrowUp, ArrowDown } from 'lucide-react';

export interface HistoricalMonthData {
  month: string;
  shortMonth: string;
  year: number;
  salesZar: number;
  targetZar: number;
  growthYoY: number;
  season?: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  isCurrent?: boolean;
}

export const TWELVE_MONTHS_HISTORICAL_SALES: HistoricalMonthData[] = [
  { month: 'October 2025', shortMonth: 'Oct 25', year: 2025, salesZar: 162000, targetZar: 150000, growthYoY: 14.1, season: 'Spring' },
  { month: 'November 2025', shortMonth: 'Nov 25', year: 2025, salesZar: 174500, targetZar: 160000, growthYoY: 15.2, season: 'Spring' },
  { month: 'December 2025', shortMonth: 'Dec 25', year: 2025, salesZar: 245000, targetZar: 230000, growthYoY: 18.5, season: 'Summer' },
  { month: 'January 2026', shortMonth: 'Jan 26', year: 2026, salesZar: 262000, targetZar: 240000, growthYoY: 19.1, season: 'Summer' },
  { month: 'February 2026', shortMonth: 'Feb 26', year: 2026, salesZar: 210000, targetZar: 195000, growthYoY: 16.7, season: 'Summer' },
  { month: 'March 2026', shortMonth: 'Mar 26', year: 2026, salesZar: 198000, targetZar: 185000, growthYoY: 15.8, season: 'Autumn' },
  { month: 'April 2026', shortMonth: 'Apr 26', year: 2026, salesZar: 182500, targetZar: 170000, growthYoY: 17.7, season: 'Autumn' },
  { month: 'May 2026', shortMonth: 'May 26', year: 2026, salesZar: 194200, targetZar: 185000, growthYoY: 15.6, season: 'Autumn' },
  { month: 'June 2026', shortMonth: 'Jun 26', year: 2026, salesZar: 211800, targetZar: 200000, growthYoY: 18.3, season: 'Winter' },
  { month: 'July 2026', shortMonth: 'Jul 26', year: 2026, salesZar: 236400, targetZar: 225000, growthYoY: 17.0, season: 'Winter' },
  { month: 'August 2026', shortMonth: 'Aug 26', year: 2026, salesZar: 268900, targetZar: 250000, growthYoY: 20.0, season: 'Winter' },
  { month: 'September 2026', shortMonth: 'Sep 26', year: 2026, salesZar: 305000, targetZar: 275000, growthYoY: 23.0, season: 'Spring', isCurrent: true }
];

interface D3MonthlySalesLineChartProps {
  data?: HistoricalMonthData[];
  height?: number;
  formatZar?: (val: number) => string;
  isCompact?: boolean;
}

export const D3MonthlySalesLineChart: React.FC<D3MonthlySalesLineChartProps> = ({
  data = TWELVE_MONTHS_HISTORICAL_SALES,
  height = 180,
  formatZar = (val: number) => `R ${val.toLocaleString('en-ZA')}`,
  isCompact = false
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<HistoricalMonthData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);

  // Resize listener to ensure responsiveness
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth || 600);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Summary statistics for 12 months context
  const stats = useMemo(() => {
    const totalSales = data.reduce((sum, d) => sum + d.salesZar, 0);
    const avgMonthly = Math.round(totalSales / data.length);
    const peak = [...data].sort((a, b) => b.salesZar - a.salesZar)[0];
    const lowest = [...data].sort((a, b) => a.salesZar - b.salesZar)[0];
    const avgGrowth = (data.reduce((sum, d) => sum + d.growthYoY, 0) / data.length).toFixed(1);

    return { totalSales, avgMonthly, peak, lowest, avgGrowth };
  }, [data]);

  // Render D3 chart
  useEffect(() => {
    if (!svgRef.current || !data.length || containerWidth <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = {
      top: 18,
      right: 24,
      bottom: isCompact ? 28 : 34,
      left: isCompact ? 48 : 56
    };
    const width = containerWidth;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    if (chartWidth <= 0 || chartHeight <= 0) return;

    // Gradient definitions
    const defs = svg.append('defs');

    // Area emerald gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'd3-sales-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.35);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.0);

    // X Scale: 12 months domain
    const xScale = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.shortMonth))
      .range([0, chartWidth])
      .padding(0.2);

    // Y Scale: 0 to maximum revenue + margin
    const maxY = d3.max(data, (d) => Math.max(d.salesZar, d.targetZar)) || 320000;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxY * 1.12])
      .nice()
      .range([chartHeight, 0]);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Horizontal Grid Lines
    const yTicks = yScale.ticks(4);
    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2 2');

    // D3 Area Generator
    const areaGenerator = d3
      .area<HistoricalMonthData>()
      .x((d) => xScale(d.shortMonth) || 0)
      .y0(chartHeight)
      .y1((d) => yScale(d.salesZar))
      .curve(d3.curveMonotoneX);

    // Append Area Fill
    g.append('path')
      .datum(data)
      .attr('fill', 'url(#d3-sales-area-gradient)')
      .attr('d', areaGenerator);

    // D3 Line Generator for Target Line
    const targetLineGenerator = d3
      .line<HistoricalMonthData>()
      .x((d) => xScale(d.shortMonth) || 0)
      .y((d) => yScale(d.targetZar))
      .curve(d3.curveMonotoneX);

    // Append Target Dashed Line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 4')
      .attr('d', targetLineGenerator)
      .attr('opacity', 0.85);

    // D3 Line Generator for Actual Sales Line
    const salesLineGenerator = d3
      .line<HistoricalMonthData>()
      .x((d) => xScale(d.shortMonth) || 0)
      .y((d) => yScale(d.salesZar))
      .curve(d3.curveMonotoneX);

    // Append Actual Sales Line
    const path = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#059669')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', salesLineGenerator);

    // Animate line path drawing
    const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 1000;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickSize(0)
      .tickPadding(8);

    const gx = g
      .append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis);

    gx.select('.domain').remove();
    gx.selectAll('text')
      .attr('font-size', isCompact ? '9px' : '10px')
      .attr('font-family', 'sans-serif')
      .attr('fill', '#64748b')
      .attr('font-weight', (d) => (String(d).includes('Sep') ? '700' : '500'));

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickSize(0)
      .tickPadding(8)
      .tickFormat((d) => `R${Number(d) / 1000}k`);

    const gy = g.append('g').call(yAxis);
    gy.select('.domain').remove();
    gy.selectAll('text')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('fill', '#94a3b8');

    // Interactive Circles for data points
    const dotsGroup = g.append('g').attr('class', 'dots');

    data.forEach((d) => {
      const cx = xScale(d.shortMonth) || 0;
      const cy = yScale(d.salesZar);

      // Pulse ring for current month
      if (d.isCurrent) {
        dotsGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 8)
          .attr('fill', '#10b981')
          .attr('opacity', 0.25)
          .append('animate')
          .attr('attributeName', 'r')
          .attr('values', '6;11;6')
          .attr('dur', '2s')
          .attr('repeatCount', 'indefinite');
      }

      // Outer halo circle
      dotsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', d.isCurrent ? 5 : 4)
        .attr('fill', d.isCurrent ? '#059669' : '#ffffff')
        .attr('stroke', d.isCurrent ? '#ffffff' : '#059669')
        .attr('stroke-width', d.isCurrent ? 2 : 2)
        .attr('cursor', 'pointer')
        .attr('class', 'transition-all hover:scale-125');

      // Transparent touch/hover hit zone
      dotsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 16)
        .attr('fill', 'transparent')
        .attr('cursor', 'pointer')
        .on('mouseenter', (event) => {
          setHoveredPoint(d);
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: cx + margin.left,
              y: cy + margin.top
            });
          }
        })
        .on('mouseleave', () => {
          setHoveredPoint(null);
          setTooltipPos(null);
        });
    });
  }, [data, height, containerWidth, isCompact]);

  return (
    <div
      ref={containerRef}
      id="d3-monthly-sales-chart-container"
      className="w-full bg-slate-50/60 rounded-xl p-3 border border-slate-200/90 space-y-2 relative transition-all"
    >
      {/* Header Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <TrendingUp className="w-3 h-3 text-emerald-700" />
          </div>
          <span className="font-bold text-slate-800">12-Month Sales Revenue Trend</span>
          <span className="text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded font-mono font-semibold">
            Oct 2025 – Sep 2026
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold border border-emerald-200/80">
            D3.js Line Engine
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-600 rounded-full inline-block" />
            <span>Actual Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-slate-400 inline-block" />
            <span>Target Benchmark</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas for D3 */}
      <div className="relative w-full">
        <svg
          ref={svgRef}
          width={containerWidth}
          height={height}
          className="w-full overflow-visible"
        />

        {/* Floating Tooltip */}
        {hoveredPoint && tooltipPos && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-slate-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl border border-slate-800 space-y-1 transition-all"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
              <span className="font-bold text-emerald-400">{hoveredPoint.month}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  hoveredPoint.growthYoY >= 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                }`}
              >
                {hoveredPoint.growthYoY >= 0 ? `+${hoveredPoint.growthYoY}%` : `${hoveredPoint.growthYoY}%`} YoY
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="text-slate-400">Actual Revenue:</span>
              <span className="font-mono font-bold text-white">{formatZar(hoveredPoint.salesZar)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[10px]">
              <span className="text-slate-400">Monthly Target:</span>
              <span className="font-mono text-slate-300">{formatZar(hoveredPoint.targetZar)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 pt-0.5 border-t border-slate-800">
              <span>Attainment:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {Math.round((hoveredPoint.salesZar / hoveredPoint.targetZar) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Historical Context Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/80 text-[11px]">
        <div className="bg-white/80 rounded-lg p-1.5 border border-slate-200/80">
          <span className="text-slate-400 block text-[9.5px]">12-Month Total</span>
          <span className="font-mono font-bold text-slate-800">{formatZar(stats.totalSales)}</span>
        </div>
        <div className="bg-white/80 rounded-lg p-1.5 border border-slate-200/80">
          <span className="text-slate-400 block text-[9.5px]">12-Mo Monthly Avg</span>
          <span className="font-mono font-bold text-slate-800">{formatZar(stats.avgMonthly)}</span>
        </div>
        <div className="bg-white/80 rounded-lg p-1.5 border border-slate-200/80">
          <span className="text-slate-400 block text-[9.5px]">Peak Performance</span>
          <span className="font-mono font-bold text-emerald-700">{formatZar(stats.peak.salesZar)} ({stats.peak.shortMonth})</span>
        </div>
        <div className="bg-white/80 rounded-lg p-1.5 border border-slate-200/80">
          <span className="text-slate-400 block text-[9.5px]">Avg YoY Trailing Growth</span>
          <span className="font-mono font-bold text-emerald-700">+{stats.avgGrowth}% YoY</span>
        </div>
      </div>
    </div>
  );
};
