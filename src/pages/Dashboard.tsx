import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Spin, Select, Space, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { Users, BookOpen, GraduationCap, Briefcase, Target, TrendingUp, RefreshCw } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import HeatmapMap from '@/components/HeatmapMap';
import RankingList from '@/components/RankingList';
import TrendChart from '@/components/TrendChart';
import WarningStats from '@/components/WarningStats';
import { useDataStore } from '@/store/dataStore';
import { useAuthStore } from '@/store/authStore';
import { useWarningStore } from '@/store/warningStore';
import { useReportStore } from '@/store/reportStore';
import { formatNumber, formatPercent, hasPermission, getRoleName } from '@/utils';
import type { HeatmapItem, RankingItem, TrendData } from '@/types';

const { Option } = Select;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { provinces, universities, disciplines, isLoading, initData, ensureData, getHeatmapData, getEmploymentRanking } = useDataStore();
  const { ensureData: ensureWarnings, getStatistics } = useWarningStore();
  const { ensureData: ensureReports } = useReportStore();
  const [rankingType, setRankingType] = useState<'discipline' | 'province' | 'university'>('university');
  const [heatmapData, setHeatmapData] = useState<HeatmapItem[]>([]);
  const [rankingData, setRankingData] = useState<RankingItem[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    ensureData();
    ensureWarnings();
    ensureReports();
  }, [ensureData, ensureWarnings, ensureReports]);

  useEffect(() => {
    if (provinces.length > 0) {
      setHeatmapData(getHeatmapData());
    }
  }, [provinces, getHeatmapData]);

  useEffect(() => {
    setRankingData(getEmploymentRanking(rankingType, 10));
  }, [rankingType, getEmploymentRanking, provinces, universities, disciplines]);

  useEffect(() => {
    if (provinces.length > 0 && trendData.length === 0) {
      const baseYear = 2020;
      const trends: TrendData[] = [];
      for (let i = 0; i < 5; i++) {
        trends.push({
          year: baseYear + i,
          registrationRate: 92 + Math.random() * 5,
          coursePassRate: 86 + Math.random() * 8,
          graduationRate: 90 + Math.random() * 6,
          employmentRate: 78 + Math.random() * 12,
          majorMatchRate: 65 + Math.random() * 18,
        });
      }
      setTrendData(trends);
    }
  }, [provinces, trendData.length]);

  const handleProvinceClick = (provinceId: string) => {
    navigate(`/province/${provinceId}`);
  };

  const handleRefresh = () => {
    initData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  const calculateAverages = () => {
    if (provinces.length === 0) return { registration: 0, course: 0, graduation: 0, employment: 0, match: 0 };
    
    const data = user?.role === 'provincial' && user.provinceId
      ? provinces.filter(p => p.id === user.provinceId)
      : provinces;
    
    return {
      registration: data.reduce((sum, p) => sum + p.registrationRate, 0) / data.length,
      course: data.reduce((sum, p) => sum + p.coursePassRate, 0) / data.length,
      graduation: data.reduce((sum, p) => sum + p.graduationRate, 0) / data.length,
      employment: data.reduce((sum, p) => sum + p.employmentRate, 0) / data.length,
      match: data.reduce((sum, p) => sum + p.majorMatchRate, 0) / data.length,
    };
  };

  const averages = calculateAverages();
  const warningStats = getStatistics();
  const totalEnrollment = provinces.reduce((sum, p) => sum + p.enrollmentCount, 0);

  const getScopeText = () => {
    if (user?.role === 'ministry') return '全国';
    if (user?.role === 'provincial') return provinces.find(p => p.id === user.provinceId)?.name || '全省';
    return universities.find(u => u.id === user?.universityId)?.name || '全校';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {getScopeText()}教学质量与就业分析看板
          </h1>
          <p className="text-gray-400 text-sm">
            实时监控教学质量指标，智能预警就业风险
          </p>
        </div>
        <Space>
          <span className="text-xs text-gray-500">
            登录身份：{getRoleName(user?.role || 'ministry')}
          </span>
          <Tooltip title="刷新数据">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white hover:border-blue-500/50 transition-all"
            >
              <RefreshCw size={18} />
            </button>
          </Tooltip>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="招生人数"
            value={totalEnrollment}
            suffix="人"
            icon={<Users size={24} />}
            trend="up"
            trendValue={3.2}
            color="blue"
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="平均报到率"
            value={averages.registration}
            icon={<BookOpen size={24} />}
            trend="up"
            trendValue={1.5}
            color="green"
            delay={0.1}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="课程通过率"
            value={averages.course}
            icon={<GraduationCap size={24} />}
            trend="stable"
            trendValue={0.2}
            color="cyan"
            delay={0.2}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="毕业率"
            value={averages.graduation}
            icon={<Target size={24} />}
            trend="up"
            trendValue={0.8}
            color="purple"
            delay={0.3}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="初次就业率"
            value={averages.employment}
            icon={<Briefcase size={24} />}
            trend="down"
            trendValue={-0.5}
            color="orange"
            delay={0.4}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="专业对口率"
            value={averages.match}
            icon={<TrendingUp size={24} />}
            trend="up"
            trendValue={2.1}
            color="pink"
            delay={0.5}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
            title={
              <div className="flex items-center justify-between w-full">
                <span className="text-white font-semibold">全国招生热力图</span>
                <span className="text-xs text-gray-400">点击省份查看详情</span>
              </div>
            }
            styles={{ body: { padding: '20px' } }}
          >
            <HeatmapMap data={heatmapData} onProvinceClick={handleProvinceClick} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full"
            title={
              <div className="flex items-center justify-between w-full">
                <span className="text-white font-semibold">预警统计</span>
              </div>
            }
            styles={{ body: { padding: '20px' } }}
          >
            <WarningStats stats={warningStats} onViewAll={() => navigate('/warnings')} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
            title={
              <div className="flex items-center justify-between w-full">
                <span className="text-white font-semibold">就业排名</span>
                <Select
                  value={rankingType}
                  onChange={setRankingType}
                  size="small"
                  className="w-32"
                  options={[
                    { value: 'university', label: '高校排名' },
                    { value: 'province', label: '省份排名' },
                    { value: 'discipline', label: '学科排名' },
                  ]}
                />
              </div>
            }
            styles={{ body: { padding: '20px' } }}
          >
            <RankingList
              title="就业排名榜"
              data={rankingData}
              type={rankingType}
              onTypeChange={setRankingType}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
            title={
              <div className="flex items-center justify-between w-full">
                <span className="text-white font-semibold">历年趋势</span>
                <span className="text-xs text-gray-400">近5年核心指标变化</span>
              </div>
            }
            styles={{ body: { padding: '20px' } }}
          >
            <TrendChart data={trendData} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
