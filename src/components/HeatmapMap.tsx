import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as echarts from 'echarts';
import type { HeatmapItem } from '../types';

interface HeatmapMapProps {
  data: HeatmapItem[];
  onProvinceClick: (provinceId: string, provinceName: string) => void;
}

const HeatmapMap: React.FC<HeatmapMapProps> = ({ data, onProvinceClick }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        const response = await fetch(
          'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'
        );
        const chinaGeoJSON = await response.json();
        
        if (chartRef.current && chinaGeoJSON) {
          echarts.registerMap('china', chinaGeoJSON);
          setIsMapLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load map data:', error);
        setIsMapLoaded(true);
      }
    };

    loadMapData();
  }, []);

  useEffect(() => {
    if (!chartRef.current || !isMapLoaded) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark');
    }

    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(23, 26, 33, 0.95)',
        borderColor: 'rgba(22, 93, 255, 0.3)',
        borderWidth: 1,
        textStyle: {
          color: 'rgba(255, 255, 255, 0.95)',
        },
        formatter: (params: any) => {
          const value = params.value || 0;
          return `
            <div style="padding: 4px 8px;">
              <div style="font-weight: 600; margin-bottom: 4px; color: #fff;">${params.name}</div>
              <div style="color: #0FC6C2;">招生人数: <span style="font-weight: 600;">${value.toLocaleString()}</span></div>
              <div style="color: #86909C; font-size: 12px; margin-top: 4px;">点击查看详情</div>
            </div>
          `;
        },
      },
      visualMap: {
        min: minValue,
        max: maxValue,
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        textStyle: {
          color: 'rgba(255, 255, 255, 0.6)',
        },
        inRange: {
          color: ['#06186E', '#0A2BA0', '#0E42D2', '#165DFF', '#2E97FF', '#54AAFF'],
        },
        calculable: true,
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        label: {
          show: true,
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 10,
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontWeight: 'bold',
          },
          itemStyle: {
            areaColor: '#165DFF',
            shadowColor: 'rgba(22, 93, 255, 0.5)',
            shadowBlur: 20,
          },
        },
        itemStyle: {
          areaColor: 'rgba(22, 93, 255, 0.1)',
          borderColor: 'rgba(22, 93, 255, 0.3)',
          borderWidth: 1,
        },
      },
      series: [
        {
          name: '招生人数',
          type: 'map',
          map: 'china',
          geoIndex: 0,
          data: data.map((d) => ({
            name: d.name,
            value: d.value,
            id: d.id,
          })),
        },
        {
          name: '重点城市',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          rippleEffect: {
            brushType: 'stroke',
            scale: 3,
            period: 4,
          },
          symbolSize: (val: number[]) => {
            const size = (val[2] / maxValue) * 20 + 6;
            return Math.min(size, 18);
          },
          itemStyle: {
            color: '#0FC6C2',
            shadowBlur: 10,
            shadowColor: '#0FC6C2',
          },
          data: data
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
            .map((d) => ({
              name: d.name,
              value: [getProvinceLngLat(d.name)[0], getProvinceLngLat(d.name)[1], d.value],
            })),
        },
      ],
    };

    chartInstance.current.setOption(option);

    chartInstance.current.on('click', (params: any) => {
      if (params.componentType === 'series' && params.seriesType === 'map') {
        const province = data.find((d) => d.name === params.name);
        if (province) {
          onProvinceClick(province.id, province.name);
        }
      }
    });

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, isMapLoaded, onProvinceClick]);

  const getProvinceLngLat = (name: string): [number, number] => {
    const coordMap: Record<string, [number, number]> = {
      '北京市': [116.46, 39.92],
      '上海市': [121.48, 31.22],
      '天津市': [117.2, 39.13],
      '重庆市': [106.54, 29.59],
      '河北省': [114.48, 38.03],
      '山西省': [112.53, 37.87],
      '辽宁省': [123.38, 41.8],
      '吉林省': [125.35, 43.88],
      '黑龙江省': [126.63, 45.75],
      '江苏省': [118.78, 32.04],
      '浙江省': [120.19, 30.26],
      '安徽省': [117.27, 31.86],
      '福建省': [119.3, 26.08],
      '江西省': [115.89, 28.68],
      '山东省': [117.0, 36.65],
      '河南省': [113.65, 34.76],
      '湖北省': [114.31, 30.52],
      '湖南省': [112.94, 28.23],
      '广东省': [113.23, 23.16],
      '广西壮族自治区': [108.33, 22.84],
      '海南省': [110.33, 20.03],
      '四川省': [104.06, 30.67],
      '贵州省': [106.71, 26.57],
      '云南省': [102.73, 25.04],
      '西藏自治区': [91.11, 29.97],
      '陕西省': [108.95, 34.27],
      '甘肃省': [103.73, 36.03],
      '青海省': [101.78, 36.62],
      '宁夏回族自治区': [106.27, 38.47],
      '新疆维吾尔自治区': [87.68, 43.77],
      '内蒙古自治区': [111.65, 40.82],
      '台湾省': [121.5, 25.05],
      '香港特别行政区': [114.17, 22.32],
      '澳门特别行政区': [113.54, 22.19],
    };
    return coordMap[name] || [104.0, 35.0];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass-card p-6 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">全国招生热力分布</h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          <span>实时数据</span>
        </div>
      </div>
      
      <div 
        ref={chartRef} 
        className="echarts-container" 
        style={{ height: '480px' }}
      />
      
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800/50 rounded-xl">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400">正在加载地图数据...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default HeatmapMap;
