import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useGivingAnalytics } from "@/hooks/useGivingAnalytics";
import { ChartContainer } from "@/components/ui/chart";
import { ChartTypeSelector } from "./charts/ChartTypeSelector";
import { AreaChartView } from "./charts/AreaChartView";
import { BarChartView } from "./charts/BarChartView";

const chartConfig = {
  tithes: {
    label: "Tithes",
    theme: {
      light: "#800000",
      dark: "#800000",
    },
  },
  offerings: {
    label: "Offerings",
    theme: {
      light: "#A52A2A",
      dark: "#A52A2A",
    },
  },
};

export default function GivingCharts() {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const { data: analytics, isLoading } = useGivingAnalytics();

  if (isLoading) {
    return <div className="h-[300px] flex items-center justify-center">Loading...</div>;
  }

  if (!analytics?.monthlyData?.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No giving data available
      </div>
    );
  }

  // Ensure we have all months represented
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  
  const transformedData = months.map(month => {
    const monthData = analytics.monthlyData.find(
      item => format(parseISO(item.month + "-01"), "MMM") === month
    );
    
    return {
      month,
      fullDate: monthData?.month || `${currentYear}-${String(months.indexOf(month) + 1).padStart(2, '0')}`,
      tithes: monthData?.tithes || 0,
      offerings: monthData?.offerings || 0,
    };
  });

  return (
    <div className="space-y-3">
      <ChartTypeSelector chartType={chartType} setChartType={setChartType} />
      
      <div className="relative h-[250px] sm:h-[300px] w-full transform transition-all duration-500 rounded-xl bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-900/50 dark:to-gray-800/50 p-2 sm:p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(128,0,0,0.2)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] backdrop-blur-sm border border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        <ChartContainer config={chartConfig}>
          <div className="w-full h-full">
            {chartType === 'area' ? (
              <AreaChartView data={transformedData} chartConfig={chartConfig} />
            ) : (
              <BarChartView data={transformedData} chartConfig={chartConfig} />
            )}
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}