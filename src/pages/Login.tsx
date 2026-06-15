import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Radio, message, Alert } from 'antd';
import { motion } from 'framer-motion';
import { User, Lock, GraduationCap, Building2, MapPin, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { useWarningStore } from '@/store/warningStore';
import { useReportStore } from '@/store/reportStore';
import type { UserRole } from '@/types';

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, user, isLoading: authLoading } = useAuthStore();
  const { initData, isLoading: dataLoading } = useDataStore();
  const { initData: initWarnings } = useWarningStore();
  const { initData: initReports } = useReportStore();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const roleOptions: { label: string; value: UserRole; icon: React.ReactNode; desc: string }[] = [
    {
      label: '教育部',
      value: 'ministry',
      icon: <GraduationCap size={20} />,
      desc: '全局数据监控与决策',
    },
    {
      label: '省级教育厅',
      value: 'provincial',
      icon: <MapPin size={20} />,
      desc: '省内高校数据管理',
    },
    {
      label: '高校',
      value: 'university',
      icon: <Building2 size={20} />,
      desc: '本校数据上报与查询',
    },
  ];

  const handleSubmit = async (values: { username: string; password: string; role: UserRole }) => {
    setLoading(true);
    try {
      const success = await login(values.username, values.password, values.role);
      if (success) {
        message.success('登录成功');
        initData();
        initWarnings();
        initReports();
        setTimeout(() => navigate('/dashboard'), 500);
      } else {
        message.error('用户名或密码错误');
      }
    } catch (error) {
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
                <GraduationCap size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">高教智能分析平台</h1>
                <p className="text-sm text-gray-400">Higher Education Analytics Platform</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              全国高等教育
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                教学质量与就业智能分析
              </span>
            </h2>

            <p className="text-gray-400 mb-8 leading-relaxed">
              实时接入招生录取、报到注册、课程成绩、毕业及就业签约数据，
              智能分析教学质量，预警就业风险，辅助科学决策。
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-blue-400 mb-1">98.7%</div>
                <div className="text-sm text-gray-400">平均报到率</div>
              </div>
              <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-green-400 mb-1">92.3%</div>
                <div className="text-sm text-gray-400">平均就业率</div>
              </div>
              <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-purple-400 mb-1">31个</div>
                <div className="text-sm text-gray-400">覆盖省份</div>
              </div>
              <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-orange-400 mb-1">120+</div>
                <div className="text-sm text-gray-400">接入高校</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card
              className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-black/30"
              styles={{ body: { padding: '40px' } }}
            >
              <div className="lg:hidden flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                  <GraduationCap size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">高教智能分析平台</h1>
                  <p className="text-xs text-gray-400">Higher Education Analytics</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">欢迎登录</h2>
              <p className="text-gray-400 text-sm mb-6">请选择您的角色并登录系统</p>

              <Alert
                type="info"
                showIcon
                message="测试账号"
                description={
                  <div className="text-xs space-y-1 mt-1">
                    <div>教育部：<code className="bg-slate-800 px-1 rounded">ministry</code> / <code className="bg-slate-800 px-1 rounded">123456</code></div>
                    <div>省厅：<code className="bg-slate-800 px-1 rounded">provincial</code> / <code className="bg-slate-800 px-1 rounded">123456</code></div>
                    <div>高校：<code className="bg-slate-800 px-1 rounded">university</code> / <code className="bg-slate-800 px-1 rounded">123456</code></div>
                  </div>
                }
                className="mb-6 bg-blue-500/10 border-blue-500/30"
              />

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ role: 'ministry', username: 'ministry', password: '123456' }}
              >
                <Form.Item name="role" label={<span className="text-gray-300 font-medium">选择角色</span>} className="mb-6">
                  <Radio.Group className="w-full">
                    <div className="grid grid-cols-3 gap-3">
                      {roleOptions.map((option) => (
                        <Radio.Button
                          key={option.value}
                          value={option.value}
                          className="h-auto p-4 border-slate-700/50 bg-slate-800/50 text-gray-300 hover:border-blue-500/50 hover:bg-slate-700/50 rounded-lg data-[checked=true]:border-blue-500 data-[checked=true]:bg-blue-500/10 data-[checked=true]:text-blue-400"
                        >
                          <div className="flex flex-col items-center gap-2">
                            {option.icon}
                            <span className="text-sm font-medium">{option.label}</span>
                            <span className="text-[10px] text-gray-500">{option.desc}</span>
                          </div>
                        </Radio.Button>
                      ))}
                    </div>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  name="username"
                  label={<span className="text-gray-300 font-medium">用户名</span>}
                  rules={[{ required: true, message: '请输入用户名' }]}
                  className="mb-4"
                >
                  <Input
                    prefix={<User size={18} className="text-gray-500" />}
                    placeholder="请输入用户名"
                    size="large"
                    className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span className="text-gray-300 font-medium">密码</span>}
                  rules={[{ required: true, message: '请输入密码' }]}
                  className="mb-6"
                >
                  <Input.Password
                    prefix={<Lock size={18} className="text-gray-500" />}
                    placeholder="请输入密码"
                    size="large"
                    iconRender={(visible) => (visible ? <EyeOff size={18} className="text-gray-500" /> : <Eye size={18} className="text-gray-500" />)}
                    className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </Form.Item>

                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading || authLoading || dataLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 font-semibold text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                  >
                    登录系统
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
