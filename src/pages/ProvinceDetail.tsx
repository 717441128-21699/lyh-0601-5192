import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Spin, Button, Table, Tag, Space, Breadcrumb } from 'antd';
import { ArrowLeft, Users, BookOpen, GraduationCap, Briefcase, Target, Building2, TrendingUp, BarChart3 } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import TrendChart from '@/components/TrendChart';
import { useDataStore } from '@/store/dataStore';
import { formatNumber, formatPercent, getUniversityLevelName, getUniversityLevelColor } from '@/utils';
import type { University, TrendData } from '@/types';

export default function ProvinceDetail() {
  const { provinceId } = useParams<{ provinceId: string }>();
  const navigate = useNavigate();
  const { getProvinceDetail, getUniversityDetail, provinces, isLoading, initData } = useDataStore();
  const [provinceDetail, setProvinceDetail] = useState<ReturnType<typeof getProvinceDetail> | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [universityDetail, setUniversityDetail] = useState<ReturnType<typeof getUniversityDetail> | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    if (provinces.length === 0) {
      initData();
    }
  }, [provinces.length, initData]);

  useEffect(() => {
    if (provinceId) {
      const detail = getProvinceDetail(provinceId);
      setProvinceDetail(detail);

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
  }, [provinceId, getProvinceDetail]);

  useEffect(() => {
    if (selectedUniversity) {
      const detail = getUniversityDetail(selectedUniversity);
      setUniversityDetail(detail);
    }
  }, [selectedUniversity, getUniversityDetail]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!provinceDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-400 mb-4">未找到该省份数据</p>
        <Button onClick={() => navigate('/dashboard')}>返回看板</Button>
      </div>
    );
  }

  const columns = [
    {
      title: '排名',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: unknown, __: University, index: number) => (
        <span className={`font-bold ${index < 3 ? 'text-orange-400' : 'text-gray-400'}`}>
          {index + 1}
        </span>
      ),
    },
    {
      title: '高校名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: University) => (
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-blue-400" />
          <span className="text-white font-medium">{text}</span>
          <Tag color={getUniversityLevelColor(record.level)} style={{ marginLeft: 8 }}>
            {getUniversityLevelName(record.level)}
          </Tag>
        </div>
      ),
    },
    {
      title: '招生人数',
      dataIndex: 'enrollmentCount',
      key: 'enrollmentCount',
      render: (value: number) => <span className="text-white">{formatNumber(value)}</span>,
      sorter: (a: University, b: University) => a.enrollmentCount - b.enrollmentCount,
    },
    {
      title: '报到率',
      dataIndex: 'registrationRate',
      key: 'registrationRate',
      render: (value: number) => (
        <span className={value >= 95 ? 'text-green-400' : value >= 90 ? 'text-yellow-400' : 'text-red-400'}>
          {formatPercent(value)}
        </span>
      ),
      sorter: (a: University, b: University) => a.registrationRate - b.registrationRate,
    },
    {
      title: '就业率',
      dataIndex: 'employmentRate',
      key: 'employmentRate',
      render: (value: number) => (
        <span className={value >= 90 ? 'text-green-400' : value >= 80 ? 'text-yellow-400' : 'text-red-400'}>
          {formatPercent(value)}
        </span>
      ),
      sorter: (a: University, b: University) => a.employmentRate - b.employmentRate,
    },
    {
      title: '专业对口率',
      dataIndex: 'majorMatchRate',
      key: 'majorMatchRate',
      render: (value: number) => (
        <span className={value >= 75 ? 'text-green-400' : value >= 65 ? 'text-yellow-400' : 'text-red-400'}>
          {formatPercent(value)}
        </span>
      ),
      sorter: (a: University, b: University) => a.majorMatchRate - b.majorMatchRate,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: University) => (
        <Button
          type="link"
          size="small"
          onClick={() => setSelectedUniversity(selectedUniversity === record.id ? null : record.id)}
        >
          {selectedUniversity === record.id ? '收起' : '查看详情'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeft size={18} />}
          onClick={() => navigate('/dashboard')}
          className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50"
        >
          返回看板
        </Button>
        <Breadcrumb className="text-sm">
          <Breadcrumb.Item className="text-gray-400 cursor-pointer hover:text-white" onClick={() => navigate('/dashboard')}>
            核心看板
          </Breadcrumb.Item>
          <Breadcrumb.Item className="text-white">{provinceDetail.name}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          {provinceDetail.name} - 教育质量分析
        </h1>
        <p className="text-gray-400 text-sm">
          共 {provinceDetail.universities.length} 所高校，详细数据如下
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="招生人数"
            value={provinceDetail.enrollmentCount}
            suffix="人"
            icon={<Users size={24} />}
            trend="up"
            trendValue={2.8}
            color="blue"
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="平均报到率"
            value={provinceDetail.registrationRate}
            icon={<BookOpen size={24} />}
            trend="up"
            trendValue={1.2}
            color="green"
            delay={0.1}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="课程通过率"
            value={provinceDetail.coursePassRate}
            icon={<GraduationCap size={24} />}
            trend="stable"
            trendValue={0.1}
            color="cyan"
            delay={0.2}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="毕业率"
            value={provinceDetail.graduationRate}
            icon={<Target size={24} />}
            trend="up"
            trendValue={0.6}
            color="purple"
            delay={0.3}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="初次就业率"
            value={provinceDetail.employmentRate}
            icon={<Briefcase size={24} />}
            trend="down"
            trendValue={-0.3}
            color="orange"
            delay={0.4}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="专业对口率"
            value={provinceDetail.majorMatchRate}
            icon={<TrendingUp size={24} />}
            trend="up"
            trendValue={1.8}
            color="pink"
            delay={0.5}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={selectedUniversity ? 12 : 24}>
          <Card
            className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
            title={
              <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-400" />
                <span className="text-white font-semibold">高校列表</span>
              </div>
            }
            styles={{ body: { padding: '20px' } }}
          >
            <Table
              dataSource={provinceDetail.universities.sort((a, b) => b.employmentRate - a.employmentRate)}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 8, showSizeChanger: false }}
              className="dark-table"
              rowClassName={(record) =>
                selectedUniversity === record.id ? 'bg-blue-500/10' : ''
              }
            />
          </Card>
        </Col>

        {selectedUniversity && universityDetail && (
          <Col xs={24} lg={12}>
            <Card
              className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full"
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 size={20} className="text-blue-400" />
                    <span className="text-white font-semibold">{universityDetail.name}</span>
                    <Tag color={getUniversityLevelColor(universityDetail.level)}>
                      {getUniversityLevelName(universityDetail.level)}
                    </Tag>
                  </div>
                </div>
              }
              styles={{ body: { padding: '20px' } }}
            >
              <div className="space-y-4">
                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">招生人数</div>
                      <div className="text-lg font-bold text-white">
                        {formatNumber(universityDetail.enrollmentCount)}
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">报到率</div>
                      <div className="text-lg font-bold text-green-400">
                        {formatPercent(universityDetail.registrationRate)}
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">毕业率</div>
                      <div className="text-lg font-bold text-blue-400">
                        {formatPercent(universityDetail.graduationRate)}
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">就业率</div>
                      <div className="text-lg font-bold text-purple-400">
                        {formatPercent(universityDetail.employmentRate)}
                      </div>
                    </div>
                  </Col>
                </Row>

                <div>
                  <h4 className="text-sm font-medium text-white mb-3">历年趋势</h4>
                  <TrendChart data={trendData} height={200} showLegend={false} />
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white mb-3">优势学科</h4>
                  <div className="flex flex-wrap gap-2">
                    {universityDetail.disciplines.map((d) => (
                      <Tag key={d.id} color="blue" className="text-sm">
                        {d.name}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      <Card
        className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
        title={
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-400" />
            <span className="text-white font-semibold">{provinceDetail.name} - 历年趋势</span>
          </div>
        }
        styles={{ body: { padding: '20px' } }}
      >
        <TrendChart data={trendData} />
      </Card>
    </div>
  );
}
