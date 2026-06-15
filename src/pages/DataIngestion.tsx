import { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Button,
  Progress,
  Space,
  Tooltip,
  Statistic,
  Alert,
  Spin,
  Switch,
  Modal,
  List,
  Badge,
  Descriptions,
  message,
} from 'antd';
import {
  Database,
  RefreshCw,
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  Download,
  Upload,
  Trash2,
  FileText,
  Activity,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import {
  formatDateTime,
  formatNumber,
} from '@/utils';
import type { DataSource, ImportRecord, CleaningRule, DataQualityMetrics } from '@/types';

export default function DataIngestion() {
  const {
    dataSources,
    importRecords,
    cleaningRules,
    dataQualityMetrics,
    isLoading,
    initData,
    toggleCleaningRule,
    runImport,
  } = useDataStore();
  const [runningImport, setRunningImport] = useState<string | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);

  useEffect(() => {
    if (dataSources.length === 0) {
      initData();
    }
  }, [dataSources.length, initData]);

  const handleRunImport = async (sourceId: string) => {
    setRunningImport(sourceId);
    try {
      const result = await runImport(sourceId);
      message.success(`成功导入 ${formatNumber(result.count)} 条记录`);
    } catch (error) {
      message.error('导入失败');
    } finally {
      setRunningImport(null);
    }
  };

  const handleViewDetail = (source: DataSource) => {
    setSelectedSource(source);
    setDetailModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'default';
      case 'error': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '运行中';
      case 'inactive': return '已停用';
      case 'error': return '异常';
      default: return status;
    }
  };

  const getImportStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'partial': return 'orange';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const getImportStatusText = (status: string) => {
    switch (status) {
      case 'success': return '成功';
      case 'partial': return '部分成功';
      case 'failed': return '失败';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <FileText size={16} />;
      case 'registration': return <Activity size={16} />;
      case 'grades': return <ShieldCheck size={16} />;
      case 'graduation': return <Zap size={16} />;
      case 'employment': return <Database size={16} />;
      default: return <Database size={16} />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'enrollment': return '招生录取';
      case 'registration': return '报到注册';
      case 'grades': return '课程成绩';
      case 'graduation': return '毕业数据';
      case 'employment': return '就业签约';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'enrollment': return '#3b82f6';
      case 'registration': return '#10b981';
      case 'grades': return '#8b5cf6';
      case 'graduation': return '#f59e0b';
      case 'employment': return '#ec4899';
      default: return '#64748b';
    }
  };

  const sourceColumns = [
    {
      title: '数据源',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DataSource) => (
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${getTypeColor(record.type)}20` }}
          >
            <span style={{ color: getTypeColor(record.type) }}>{getTypeIcon(record.type)}</span>
          </div>
          <div>
            <div className="text-white font-medium">{text}</div>
            <div className="text-xs text-gray-400">{getTypeName(record.type)}</div>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'active' && <CheckCircle size={12} className="inline mr-1" />}
          {status === 'error' && <AlertTriangle size={12} className="inline mr-1" />}
          {status === 'inactive' && <Clock size={12} className="inline mr-1" />}
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '记录数',
      dataIndex: 'recordCount',
      key: 'recordCount',
      width: 120,
      render: (value: number) => (
        <span className="text-white font-mono">{formatNumber(value)}</span>
      ),
    },
    {
      title: '最后同步',
      dataIndex: 'lastSync',
      key: 'lastSync',
      width: 180,
      render: (date: string) => (
        <span className="text-gray-400 text-sm">{formatDateTime(date)}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: DataSource) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<Settings size={16} />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="手动同步">
            <Button
              type="text"
              size="small"
              icon={<RefreshCw size={16} className={runningImport === record.id ? 'animate-spin' : ''} />}
              onClick={() => handleRunImport(record.id)}
              loading={runningImport === record.id}
              disabled={record.status !== 'active'}
            />
          </Tooltip>
          <Tooltip title="立即导入">
            <Button
              type="primary"
              size="small"
              icon={<Play size={16} />}
              onClick={() => handleRunImport(record.id)}
              loading={runningImport === record.id}
              disabled={record.status !== 'active'}
            >
              导入
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const importColumns = [
    {
      title: '数据源',
      dataIndex: 'sourceName',
      key: 'sourceName',
      render: (text: string) => <span className="text-white">{text}</span>,
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text?: string) => (
        <span className="text-gray-400">{text || '-'}</span>
      ),
    },
    {
      title: '记录数',
      dataIndex: 'recordCount',
      key: 'recordCount',
      width: 120,
      render: (value: number) => (
        <span className="text-white font-mono">{formatNumber(value)}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getImportStatusColor(status)}>
          {status === 'success' && <CheckCircle size={12} className="inline mr-1" />}
          {status === 'failed' && <AlertTriangle size={12} className="inline mr-1" />}
          {getImportStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 120,
      render: (text: string) => <span className="text-gray-400">{getTypeName(text)}</span>,
    },
    {
      title: '导入时间',
      dataIndex: 'importTime',
      key: 'importTime',
      width: 180,
      render: (date: string) => (
        <span className="text-gray-400 text-sm">{formatDateTime(date)}</span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">数据接入</h1>
          <p className="text-gray-400 text-sm">
            管理数据源接入、数据清洗规则和导入记录
          </p>
        </div>
        <Tooltip title="刷新数据">
          <button
            onClick={() => initData()}
            className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white hover:border-blue-500/50 transition-all"
          >
            <RefreshCw size={18} />
          </button>
        </Tooltip>
      </div>

      <Alert
        type="info"
        showIcon
        message="实时数据接入"
        description="系统实时接入招生录取、报到注册、课程成绩、毕业及就业签约数据，自动清洗并按多维度聚合。支持手动触发数据同步。"
        className="bg-blue-500/10 border-blue-500/30"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <Statistic
              title={<span className="text-gray-400 flex items-center gap-2"><Database size={14} /> 数据源</span>}
              value={dataSources.length}
              className="text-white"
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <Statistic
              title={<span className="text-gray-400 flex items-center gap-2"><CheckCircle size={14} /> 完整性</span>}
              value={dataQualityMetrics.completeness}
              suffix="%"
              className="text-white"
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <Statistic
              title={<span className="text-gray-400 flex items-center gap-2"><ShieldCheck size={14} /> 准确性</span>}
              value={dataQualityMetrics.accuracy}
              suffix="%"
              className="text-white"
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <Statistic
              title={<span className="text-gray-400 flex items-center gap-2"><Activity size={14} /> 及时性</span>}
              value={dataQualityMetrics.timeliness}
              suffix="%"
              className="text-white"
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
            title={
              <div className="flex items-center gap-2">
                <Database size={20} className="text-blue-400" />
                <span className="text-white font-semibold">数据源管理</span>
                <Tag color="blue">{dataSources.length}个</Tag>
              </div>
            }
            styles={{ body: { padding: '20px' } }}
          >
            <Table
              dataSource={dataSources}
              columns={sourceColumns}
              rowKey="id"
              pagination={false}
              className="dark-table"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full"
            title={
              <div className="flex items-center gap-2">
                <Settings size={20} className="text-purple-400" />
                <span className="text-white font-semibold">数据清洗规则</span>
              </div>
            }
            styles={{ body: { padding: '20px' } }}
          >
            <List
              dataSource={cleaningRules}
              renderItem={(rule: CleaningRule) => (
                <List.Item
                  className="border-b border-slate-700/50 last:border-0 py-3"
                  style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.5)' }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Badge status={rule.enabled ? 'processing' : 'default'} />
                      <div>
                        <div className="text-white font-medium">{rule.name}</div>
                        <div className="text-xs text-gray-400">{rule.description}</div>
                        <div className="flex gap-1 mt-1">
                          {rule.affectedFields.map((field, idx) => (
                            <Tag key={idx} color="default" className="text-xs m-0">
                              {field}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onChange={() => toggleCleaningRule(rule.id)}
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
        title={
          <div className="flex items-center gap-2">
            <Upload size={20} className="text-green-400" />
            <span className="text-white font-semibold">导入记录</span>
            <Tag color="green">{importRecords.length}条</Tag>
          </div>
        }
        styles={{ body: { padding: '20px' } }}
      >
        <Table
          dataSource={importRecords}
          columns={importColumns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          className="dark-table"
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Settings size={20} className="text-blue-400" />
            <span>数据源详情 - {selectedSource?.name}</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedSource && (
          <div className="space-y-6">
            <Descriptions
              bordered
              column={2}
              size="small"
              className="dark-descriptions"
            >
              <Descriptions.Item label="数据源名称">{selectedSource.name}</Descriptions.Item>
              <Descriptions.Item label="数据类型">
                <Tag color={getTypeColor(selectedSource.type)}>
                  {getTypeName(selectedSource.type)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedSource.status)}>
                  {getStatusText(selectedSource.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="记录数">
                <span className="text-white font-mono">{formatNumber(selectedSource.recordCount)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="最后同步" span={2}>
                {formatDateTime(selectedSource.lastSync)}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <h4 className="text-white font-semibold mb-3">数据质量指标</h4>
              <Row gutter={[16, 16]}>
                <Col xs={12}>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">完整性</span>
                      <span className="text-white font-bold">{dataQualityMetrics.completeness}%</span>
                    </div>
                    <Progress
                      percent={dataQualityMetrics.completeness}
                      showInfo={false}
                      strokeColor="#10b981"
                    />
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">准确性</span>
                      <span className="text-white font-bold">{dataQualityMetrics.accuracy}%</span>
                    </div>
                    <Progress
                      percent={dataQualityMetrics.accuracy}
                      showInfo={false}
                      strokeColor="#3b82f6"
                    />
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">及时性</span>
                      <span className="text-white font-bold">{dataQualityMetrics.timeliness}%</span>
                    </div>
                    <Progress
                      percent={dataQualityMetrics.timeliness}
                      showInfo={false}
                      strokeColor="#f59e0b"
                    />
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">唯一性</span>
                      <span className="text-white font-bold">{dataQualityMetrics.uniqueness}%</span>
                    </div>
                    <Progress
                      percent={dataQualityMetrics.uniqueness}
                      showInfo={false}
                      strokeColor="#8b5cf6"
                    />
                  </div>
                </Col>
              </Row>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                icon={<RefreshCw size={16} />}
                onClick={() => handleRunImport(selectedSource.id)}
                loading={runningImport === selectedSource.id}
                disabled={selectedSource.status !== 'active'}
              >
                手动同步
              </Button>
              <Button
                type="primary"
                icon={<Play size={16} />}
                onClick={() => handleRunImport(selectedSource.id)}
                loading={runningImport === selectedSource.id}
                disabled={selectedSource.status !== 'active'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
              >
                立即导入
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
