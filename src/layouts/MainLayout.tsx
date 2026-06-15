import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, Tooltip } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  AlertTriangle,
  FileSpreadsheet,
  FileBarChart,
  Database,
  LogOut,
  User,
  Bell,
  ChevronRight,
  MapPin,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWarningStore } from '@/store/warningStore';
import { hasPermission, getRoleName } from '@/utils';
import type { UserRole } from '@/types';

const { Header, Sider, Content } = Layout;

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
  roles?: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: '核心看板',
    icon: <LayoutDashboard size={20} />,
    path: '/dashboard',
    permission: 'dashboard:view',
  },
  {
    key: 'warnings',
    label: '预警中心',
    icon: <AlertTriangle size={20} />,
    path: '/warnings',
    permission: 'warning:view',
  },
  {
    key: 'curriculum',
    label: '培养方案',
    icon: <FileSpreadsheet size={20} />,
    path: '/curriculum',
    permission: 'curriculum:view',
  },
  {
    key: 'reports',
    label: '报告中心',
    icon: <FileBarChart size={20} />,
    path: '/reports',
    permission: 'report:view',
  },
  {
    key: 'ingestion',
    label: '数据接入',
    icon: <Database size={20} />,
    path: '/ingestion',
    permission: 'ingestion:view',
    roles: ['ministry'],
  },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { warnings } = useWarningStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const filteredMenuItems = menuItems.filter((item) => {
    if (!user) return false;
    if (item.roles && !item.roles.includes(user.role)) return false;
    if (item.permission && !hasPermission(user.permissions, item.permission)) return false;
    return true;
  });

  const pendingCount = warnings.filter((w) => {
    if (!user) return false;
    if (user.role === 'university') return w.status === 'pending_university' && w.universityId === user.universityId;
    if (user.role === 'provincial') return w.status === 'pending_provincial' && w.provinceId === user.provinceId;
    if (user.role === 'ministry') return w.status === 'pending_ministry';
    return false;
  }).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <User size={16} />,
        label: (
          <div className="flex flex-col">
            <span className="font-medium">{user?.name}</span>
            <span className="text-xs text-gray-400">{getRoleName(user?.role || 'ministry')}</span>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        icon: <LogOut size={16} />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/province')) return 'dashboard';
    return path.split('/')[1] || 'dashboard';
  };

  if (!user) return null;

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        className="border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl"
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700/50">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <GraduationCap size={22} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-sm">高教智能分析</span>
                  <span className="text-[10px] text-gray-400">Higher Education Analytics</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white hover:bg-slate-800/50"
          />
        </div>

        <div className="px-3 py-4">
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={filteredMenuItems.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: (
                <Link to={item.path} className="flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.key === 'warnings' && pendingCount > 0 && (
                    <Badge count={pendingCount} size="small" color="#F53F3F" />
                  )}
                </Link>
              ),
            }))}
            className="border-0 bg-transparent"
          />
        </div>

        {!collapsed && (
          <div className="absolute bottom-4 left-3 right-3">
            <div className="rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/30">
                  <Building2 size={16} className="text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-300">当前层级</span>
                  <span className="text-sm font-semibold text-white">{getRoleName(user.role)}</span>
                </div>
              </div>
              {user.role === 'provincial' && (
                <div className="flex items-center gap-1 text-xs text-blue-300">
                  <MapPin size={12} />
                  <span>北京市教育厅</span>
                </div>
              )}
              {user.role === 'university' && (
                <div className="flex items-center gap-1 text-xs text-blue-300">
                  <MapPin size={12} />
                  <span>北京大学</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Sider>

      <Layout>
        <Header className="flex h-16 items-center justify-between px-6 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm"
            >
              <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                首页
              </Link>
              <ChevronRight size={14} className="text-gray-600" />
              <span className="text-white font-medium">
                {filteredMenuItems.find((m) => m.key === getSelectedKey())?.label || '核心看板'}
              </span>
            </motion.div>
          </div>

          <div className="flex items-center gap-4">
            <Tooltip title="待处理预警">
              <Badge count={pendingCount} size="small" offset={[-2, 2]}>
                <Button
                  type="text"
                  icon={<Bell size={20} />}
                  className="text-gray-400 hover:text-white hover:bg-slate-800/50 relative"
                  onClick={() => navigate('/warnings')}
                />
              </Badge>
            </Tooltip>

            <div className="h-8 w-px bg-slate-700" />

            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 rounded-lg px-2 py-1 transition-colors">
                <Avatar
                  size={36}
                  className="bg-gradient-to-br from-blue-500 to-purple-600 font-semibold"
                >
                  {user.name.charAt(0)}
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{user.name}</span>
                  <span className="text-xs text-gray-400">{getRoleName(user.role)}</span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Content>
      </Layout>
    </Layout>
  );
}
