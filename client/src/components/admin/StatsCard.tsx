import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconTextColor: string;
  change?: {
    value: number;
    isIncrease: boolean;
  };
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  iconBgColor,
  iconTextColor,
  change,
  subtitle
}: StatsCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className={`p-2 ${iconBgColor} rounded-lg`}>
            <i className={`${icon} ${iconTextColor} text-xl`}></i>
          </div>
        </div>
        <div>
          <h4 className="text-3xl font-bold text-gray-800">{value}</h4>
          {change && (
            <div className="flex items-center mt-2 text-sm">
              <span className={`flex items-center ${change.isIncrease ? 'text-green-600' : 'text-red-600'} mr-2`}>
                <i className={`${change.isIncrease ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
                {change.value}%
              </span>
              <span className="text-gray-600">{subtitle || 'vs. last month'}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
