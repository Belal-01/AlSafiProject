import React from "react";
import { Card, Statistic, Progress, Space } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: number | string;
  prefix?: string; // e.g., "$"
  suffix?: string; // e.g., "%"
  precision?: number; // for decimal places
  icon?: ReactNode;
  iconBgColor?: string;
  trend?: "up" | "down" | null;
  trendValue?: string; // e.g., "12%"
  progress?: number; // 0-100 for progress bar
  progressColor?: string;
  footer?: ReactNode;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision,
  icon,
  iconBgColor = "#f0f0f0",
  trend,
  trendValue,
  progress,
  progressColor,
  footer,
  loading = false,
  className = "",
  onClick,
}) => {
  return (
    <Card
      className={`transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}
      loading={loading}
      onClick={onClick}
      styles={{
        body: { padding: "20px" },
      }}
      hoverable={true}
    >
      <div className="flex items-start justify-between">
        <Space direction="vertical" size="small" className="flex-1">
          <Statistic
            title={title}
            value={value}
            prefix={prefix}
            suffix={suffix}
            precision={precision}
            valueStyle={{ fontSize: "24px", fontWeight: 600 }}
          />

          {trend && trendValue && (
            <div className="flex items-center gap-1 text-sm">
              {trend === "up" ? (
                <ArrowUpOutlined style={{ color: "#52c41a" }} />
              ) : (
                <ArrowDownOutlined style={{ color: "#ff4d4f" }} />
              )}
              <span style={{ color: trend === "up" ? "#52c41a" : "#ff4d4f" }}>
                {trendValue}
              </span>
              <span className="text-gray-400 ml-1">vs last month</span>
            </div>
          )}

          {progress !== undefined && (
            <div className="mt-2">
              <Progress
                percent={progress}
                strokeColor={progressColor}
                showInfo={false}
                size="small"
              />
            </div>
          )}

          {footer && <div className="mt-2">{footer}</div>}
        </Space>

        {icon && (
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
           // style={{ backgroundColor: iconBgColor }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default KpiCard;
