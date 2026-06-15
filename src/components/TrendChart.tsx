import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as echarts from 'echarts';
import type { TrendData } from '../types';

interface TrendChartProps {
  data: TrendData[];
  title?: string;
  height?: number;
  metrics?: Array<keyof TrendData>;
  showLegend?: boolean;
}

const METRIC_CONFIG: Record<string, { name: string; color: string }> = {
  registrationRate: { name: '报到率', color: '#165DFF' },
  coursePassRate: { name: '课程通过率', color: '#0FC6C2' },
  graduationRate: { name: '毕业率', color: '#722ED1' },
  employmentRate: { name: '初次就业率', color: '#FF7D00' },
  majorMatchRate: { name: '专业对口率', color: '#F53F3F' },
};

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title = '历年趋势分析',
  height = 350,
  metrics = ['registrationRate', 'coursePassRate', 'graduationRate', 'employmentRate', 'majorMatchRate'],
  showLegend = true,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark');
    }

    const years = data.map((d) => `${d.year}年`);
    
    const series: echarts.EChartsOption['series'] = metrics.map((metric) => ({
      name: METRIC_CONFIG[metric].name,
      type: 'line' as const,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: METRIC_CONFIG[metric].color,
      },
      itemStyle: {
        color: METRIC_CONFIG[metric].color,
        borderWidth: 2,
        borderColor: '#171A21',
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${METRIC_CONFIG[metric].color}40` },
          { offset: 1, color: `${METRIC_CONFIG[metric].color}00` },
        ]),
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          shadowBlur: 10,
          shadowColor: METRIC_CONFIG[metric].color,
        },
      },
      data: data.map((d) => d[metric]),
    }));

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      title: {
        text: title,
        left: 'left',
        textStyle: {
          color: 'rgba(255, 255, 255, 0.95)',
          fontSize: 16,
          fontWeight: 600,
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(23, 26, 33, 0.95)',
        borderColor: 'rgba(22, 93, 255, 0.3)',
        borderWidth: 1,
        textStyle: {
          color: 'rgba(255, 255, 255, 0.95)',
        },
        axisPointer: {
          type: 'cross',
          lineStyle: {
            color: 'rgba(22, 93, 255, 0.3)',
          },
          crossStyle: {
            color: 'rgba(22, 93, 255, 0.3)',
          },
        },
        formatter: (params: any) => {
          let html = `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`;
          params.forEach((param: any) => {
            html += `
              <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: ${param.color};"></span>
                <span style="flex: 1;">${param.seriesName}:</span>
                <span style="font-weight: 600; color: ${param.color};">${param.value.toFixed(1)}%</span>
              </div>
            `;
          });
          return html;
        },
      },
      legend: showLegend
        ? {
            data: metrics.map((m) => METRIC_CONFIG[m].name),
            top: 0,
            right: 0,
            textStyle: {
              color: 'rgba(255, 255, 255, 0.6)',
            },
            itemWidth: 12,
            itemHeight: 12,
          }
        : undefined,
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 15,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: years,
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'value',
        min: 50,
        max: 100,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 11,
          formatter: '{value}%',
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.05)',
            type: 'dashed',
          },
        },
      },
      series,
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, title, metrics]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      <div
        ref={chartRef}
        className="echarts-container"
        style={{ height }}
      />
    </motion.div>
  );
};

export default TrendChart;
