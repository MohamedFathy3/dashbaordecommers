// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../components/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { TrendingUp, Filter, Users, ShoppingCart, Package, BarChart3 } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/Card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Area, AreaChart, ResponsiveContainer } from "recharts";

interface MonthlyData {
  [key: string]: number;
}

interface ReportData {
  users_per_month: MonthlyData;
  orders_pending_per_month: MonthlyData;
  orders_confirmed_per_month: MonthlyData;
  orders_cancelled_per_month: MonthlyData;
  total_orders_per_month: MonthlyData;
  offers_per_month: MonthlyData;
  TOTAL: {
    users: number;
    orders_pending: number;
    orders_confirmed: number;
    orders_cancelled: number;
    total_orders: number;
    offers: number;
  };
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonths, setSelectedMonths] = useState<number>(6);

  const primaryColor = "#039fb3";
  const pendingColor = "#f59e0b";
  const confirmedColor = "#10b981";
  const cancelledColor = "#ef4444";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const data = await apiFetch("/reports/monthly");
        setReportData(data.data);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchReportData();
    }
  }, [user]);

  // تحويل البيانات من الشكل القديم إلى الجديد
  const transformMonthlyData = (data: MonthlyData): Array<{ month: string; count: number }> => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return months.map(month => ({
      month: month.slice(0, 3), // استخدام أول 3 أحرف فقط من اسم الشهر
      count: data[month] || 0
    }));
  };

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-[#039fb3] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg text-gray-700 dark:text-gray-300">Checking your login status...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-[#039fb3] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  const prepareChartData = (data: Array<{ month: string; count: number }>) => {
    return data.slice(-selectedMonths);
  };

  const allMonths = reportData ? transformMonthlyData(reportData.users_per_month).map(item => item.month) : [];

  const lineChartConfig = {
    count: {
      label: "Count",
      color: primaryColor,
    },
  } satisfies ChartConfig;

  const barChartConfig = {
    pending: {
      label: "Pending",
      color: pendingColor,
    },
    confirmed: {
      label: "Confirmed",
      color: confirmedColor,
    },
    cancelled: {
      label: "Cancelled",
      color: cancelledColor,
    },
  } satisfies ChartConfig;

  const radarChartConfig = {
    count: {
      label: "Count",
      color: primaryColor,
    },
  } satisfies ChartConfig;

  const areaChartConfig = {
    count: {
      label: "Count",
      color: primaryColor,
    },
  } satisfies ChartConfig;

  // Chart Components مع البيانات الجديدة
  const ChartLineDots = ({ data, title, description, total }: { 
    data: Array<{ month: string; count: number }>, 
    title: string, 
    description: string,
    total: number 
  }) => {
    const chartData = prepareChartData(data);
    
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={lineChartConfig}>
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="currentColor" 
                strokeOpacity={0.2}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="count"
                type="monotone"
                stroke={`var(--color-count)`}
                strokeWidth={3}
                dot={{
                  fill: `var(--color-count)`,
                  strokeWidth: 2,
                  r: 5,
                  stroke: '#fff'
                }}
                activeDot={{
                  r: 7,
                  stroke: '#fff',
                  strokeWidth: 2,
                  fill: `var(--color-count)`,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Last {selectedMonths} months <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            {chartData.filter(item => item.count > 0).length} months with data
          </div>
        </CardFooter>
      </Card>
    );
  };

  const ChartBarMultiple = ({ title, description }: { 
    title: string, 
    description: string,
  }) => {
    const pendingData = transformMonthlyData(reportData?.orders_pending_per_month || {});
    const confirmedData = transformMonthlyData(reportData?.orders_confirmed_per_month || {});
    const cancelledData = transformMonthlyData(reportData?.orders_cancelled_per_month || {});
    
    const chartPending = prepareChartData(pendingData);
    const chartConfirmed = prepareChartData(confirmedData);
    const chartCancelled = prepareChartData(cancelledData);
    
    const combinedData = chartPending.map((item, index) => ({
      month: item.month,
      pending: item.count,
      confirmed: chartConfirmed[index]?.count || 0,
      cancelled: chartCancelled[index]?.count || 0
    }));

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="flex gap-4">
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData?.TOTAL.orders_pending || 0}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData?.TOTAL.orders_confirmed || 0}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Confirmed</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData?.TOTAL.orders_cancelled || 0}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Cancelled</div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig}>
            <BarChart 
              data={combinedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="currentColor" 
                strokeOpacity={0.2}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar 
                dataKey="pending" 
                fill="var(--color-pending)" 
                stroke="var(--color-pending)"
                strokeWidth={1}
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="confirmed" 
                fill="var(--color-confirmed)" 
                stroke="var(--color-confirmed)"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="cancelled" 
                fill="var(--color-cancelled)" 
                stroke="var(--color-cancelled)"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Orders Comparison <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Last {selectedMonths} months comparison
          </div>
        </CardFooter>
      </Card>
    );
  };

  const ChartRadarGridFill = ({ data, title, description, total }: { 
    data: Array<{ month: string; count: number }>, 
    title: string, 
    description: string,
    total: number 
  }) => {
    const chartData = prepareChartData(data);
    
    const maxValue = Math.max(...chartData.map(item => item.count)) * 1.2;
    
    return (
      <Card>
        <CardHeader className="items-center pb-4">
          <div className="flex justify-between items-center w-full">
            <div className="text-center flex-1">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <Package className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-0">
          <ChartContainer
            config={radarChartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadarChart 
              data={chartData}
              margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarGrid 
                stroke="currentColor" 
                strokeOpacity={0.3}
              />
              <PolarAngleAxis 
                dataKey="month" 
                tick={{ 
                  fill: 'currentColor', 
                  fontSize: 11,
                  fontWeight: 500 
                }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, maxValue]}
                tick={{ 
                  fill: 'currentColor', 
                  fontSize: 10 
                }}
              />
              <Radar
                name="Offers"
                dataKey="count"
                stroke={`var(--color-count)`}
                strokeWidth={2}
                fill={`var(--color-count)`}
                fillOpacity={0.4}
              />
            </RadarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            Distribution <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground flex items-center gap-2 leading-none">
            Last {selectedMonths} months
          </div>
        </CardFooter>
      </Card>
    );
  };

  const ChartAreaStacked = ({ data, title, description, total }: { 
    data: Array<{ month: string; count: number }>, 
    title: string, 
    description: string,
    total: number 
  }) => {
    const chartData = prepareChartData(data);
    
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={areaChartConfig}>
            <AreaChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="currentColor" 
                strokeOpacity={0.2}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Area
                dataKey="count"
                type="monotone"
                stroke={`var(--color-count)`}
                strokeWidth={3}
                fill={`var(--color-count)`}
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Area trends <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Last {selectedMonths} months trend
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Here&apos;s what&apos;s happening with your platform today.
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by months:
              </span>
            </div>
            <div className="flex gap-2">
              {[3, 6, 12].map((months) => (
                <button
                  key={months}
                  onClick={() => setSelectedMonths(months)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedMonths === months
                      ? 'bg-[#039fb3] text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Last {months} months
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-[#039fb3]">{reportData?.TOTAL.users || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Users</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-[#f59e0b]">{reportData?.TOTAL.orders_pending || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending Orders</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-[#10b981]">{reportData?.TOTAL.orders_confirmed || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Confirmed Orders</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-[#ef4444]">{reportData?.TOTAL.orders_cancelled || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cancelled Orders</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-[#8b5cf6]">{reportData?.TOTAL.total_orders || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Orders</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-[#06b6d4]">{reportData?.TOTAL.offers || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Offers</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartLineDots 
            data={transformMonthlyData(reportData?.users_per_month || {})}
            title="User Growth Trend"
            description="New users registration over time"
            total={reportData?.TOTAL.users || 0}
          />

          <ChartBarMultiple 
            title="Orders Status"
            description="Pending, Confirmed & Cancelled orders comparison"
          />

          <ChartRadarGridFill 
            data={transformMonthlyData(reportData?.offers_per_month || {})}
            title="Offers Distribution"
            description="Offers performance across months"
            total={reportData?.TOTAL.offers || 0}
          />

          <ChartAreaStacked 
            data={transformMonthlyData(reportData?.total_orders_per_month || {})}
            title="Total Orders Trend"
            description="All orders trend over time"
            total={reportData?.TOTAL.total_orders || 0}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Totals</CardTitle>
              <CardDescription>Summary of monthly data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Users (Monthly)</span>
                  <span className="font-bold text-gray-900 dark:text-white">{reportData?.TOTAL.users || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Pending Orders (Monthly)</span>
                  <span className="font-bold text-gray-900 dark:text-white">{reportData?.TOTAL.orders_pending || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Confirmed Orders (Monthly)</span>
                  <span className="font-bold text-gray-900 dark:text-white">{reportData?.TOTAL.orders_confirmed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Offers (Monthly)</span>
                  <span className="font-bold text-gray-900 dark:text-white">{reportData?.TOTAL.offers || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>Current platform statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Months Tracked</span>
                  <span className="font-bold text-gray-900 dark:text-white">{allMonths.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Months with Data</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {allMonths.filter(month => {
                      const monthData = transformMonthlyData(reportData?.users_per_month || {});
                      return monthData.find(m => m.month === month)?.count || 0 > 0;
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Current View</span>
                  <span className="font-bold text-gray-900 dark:text-white">Last {selectedMonths} months</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Order Completion Rate</span>
                  <span className="font-bold text-green-600">
                    {reportData?.TOTAL.total_orders ? 
                      Math.round((reportData.TOTAL.orders_confirmed / reportData.TOTAL.total_orders) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}