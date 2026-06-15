import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import MainLayout from "@/layouts/MainLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ProvinceDetail from "@/pages/ProvinceDetail";
import WarningCenter from "@/pages/WarningCenter";
import Curriculum from "@/pages/Curriculum";
import ReportCenter from "@/pages/ReportCenter";
import DataIngestion from "@/pages/DataIngestion";
import { useAuthStore } from "@/store/authStore";
import { hasPermission } from "@/utils";

function PrivateRoute({ children, permission }: { children: React.ReactNode; permission?: string }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && user && !hasPermission(user.permissions, permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#3b82f6",
          colorInfo: "#3b82f6",
          colorSuccess: "#10b981",
          colorWarning: "#f59e0b",
          colorError: "#ef4444",
          borderRadius: 8,
          fontFamily: "Noto Sans SC, system-ui, -apple-system, sans-serif",
        },
        components: {
          Modal: {
            contentBg: "#0f172a",
            headerBg: "#0f172a",
            titleColor: "#fff",
          },
          Drawer: {
            colorBgElevated: "#1e293b",
          },
          Dropdown: {
            colorBgElevated: "#1e293b",
          },
          Select: {
            colorBgContainer: "#1e293b",
            colorBorder: "#334155",
            colorTextPlaceholder: "#64748b",
          },
          Input: {
            colorBgContainer: "#1e293b",
            colorBorder: "#334155",
            colorTextPlaceholder: "#64748b",
          },
          Table: {
            colorBgContainer: "transparent",
            colorBgElevated: "#1e293b",
            colorBorderSecondary: "#334155",
            headerBg: "#1e293b",
            headerColor: "#94a3b8",
            rowHoverBg: "rgba(59, 130, 246, 0.1)",
          },
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route
              path="dashboard"
              element={
                <PrivateRoute permission="dashboard:view">
                  <Dashboard />
                </PrivateRoute>
              }
            />
            
            <Route
              path="province/:provinceId"
              element={
                <PrivateRoute permission="dashboard:view">
                  <ProvinceDetail />
                </PrivateRoute>
              }
            />
            
            <Route
              path="warnings"
              element={
                <PrivateRoute permission="warning:view">
                  <WarningCenter />
                </PrivateRoute>
              }
            />
            
            <Route
              path="curriculum"
              element={
                <PrivateRoute permission="curriculum:view">
                  <Curriculum />
                </PrivateRoute>
              }
            />
            
            <Route
              path="reports"
              element={
                <PrivateRoute permission="report:view">
                  <ReportCenter />
                </PrivateRoute>
              }
            />
            
            <Route
              path="ingestion"
              element={
                <PrivateRoute permission="ingestion:view">
                  <DataIngestion />
                </PrivateRoute>
              }
            />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}
