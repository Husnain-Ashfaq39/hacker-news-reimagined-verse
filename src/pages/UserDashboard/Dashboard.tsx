import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useCallback, useState, useEffect } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { Clock, Newspaper, TrendingUp, Calendar, Activity, ArrowUp, Zap, BookMarked, MessageSquare, Eye } from "lucide-react";

// Sample data - would be replaced with real data from an API
const weeklyScreenTimeData = [
  { name: "Mon", hours: 1.5 },
  { name: "Tue", hours: 2.3 },
  { name: "Wed", hours: 1.8 },
  { name: "Thu", hours: 2.5 },
  { name: "Fri", hours: 3.2 },
  { name: "Sat", hours: 4.1 },
  { name: "Sun", hours: 3.5 },
];

const monthlyScreenTimeData = [
  { name: "Week 1", hours: 12.5 },
  { name: "Week 2", hours: 14.3 },
  { name: "Week 3", hours: 11.8 },
  { name: "Week 4", hours: 15.2 },
];

const newsReadData = [
  { name: "Mon", count: 8 },
  { name: "Tue", count: 12 },
  { name: "Wed", count: 10 },
  { name: "Thu", count: 15 },
  { name: "Fri", count: 11 },
  { name: "Sat", count: 18 },
  { name: "Sun", count: 14 },
];

const categoryData = [
  { name: "Technology", count: 45 },
  { name: "Business", count: 28 },
  { name: "Science", count: 22 },
  { name: "Politics", count: 15 },
  { name: "Health", count: 10 },
  { name: "Other", count: 20 },
];

const chartConfig = {
  screenTime: {
    label: "Screen Time",
    theme: {
      light: "#ff6600",
      dark: "#ff6600",
    },
  },
  newsRead: {
    label: "News Articles",
    theme: {
      light: "#0088fe",
      dark: "#0088fe",
    },
  },
  category: {
    label: "Categories",
    theme: {
      light: "#00c49f",
      dark: "#00c49f",
    },
  },
  area: {
    label: "Area Chart",
    theme: {
      light: "url(#colorGradient)",
      dark: "url(#colorGradient)",
    },
  },
};

export function UserDashboard() {
  const [timeRange, setTimeRange] = useState("weekly");
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mount
    setAnimate(true);
  }, []);

  const getScreenTimeData = useCallback(() => {
    return timeRange === "weekly" ? weeklyScreenTimeData : monthlyScreenTimeData;
  }, [timeRange]);
  
  const totalScreenTime = getScreenTimeData().reduce((acc, curr) => acc + curr.hours, 0).toFixed(1);
  const totalNewsRead = newsReadData.reduce((acc, curr) => acc + curr.count, 0);
  const averageDailyScreenTime = (getScreenTimeData().reduce((acc, curr) => acc + curr.hours, 0) / getScreenTimeData().length).toFixed(1);

  // Calculate percentage change for KPIs (just for UI demo)
  const screenTimeChange = "+12.5%";
  const articlesReadChange = "+8.2%";
  const dailyAverageChange = "+5.3%";

  return (
    <PageLayout>
      <div className="relative overflow-hidden">
        {/* Background elements for futuristic effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-background to-background z-0"></div>
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-r from-hn-orange/10 to-blue-500/10 blur-3xl opacity-50 z-0"></div>
        <div className="absolute bottom-0 right-0 w-2/3 h-48 bg-gradient-to-l from-green-500/10 to-purple-500/10 blur-3xl opacity-30 z-0"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHN0cm9rZT0icmdiYSgxMDAsMTAwLDEwMCwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgc3Ryb2tlPSJub25lIi8+PHBhdGggZD0iTTYwIDBoLTYwdjYwaDYwdi02MHoiLz48cGF0aCBkPSJNMzAgMGgtMzB2NjBoMzB2LTYweiIvPjxwYXRoIGQ9Ik0wIDMwaDYwIi8+PHBhdGggZD0iTTMwIDMwdjMwIi8+PHBhdGggZD0iTTMwIDBoLTMwdjMwaDMwdi0zMHoiLz48cGF0aCBkPSJNMzAgMHYzMCIvPjxwYXRoIGQ9Ik0wIDE1aDMwIi8+PC9nPjwvZz48L3N2Zz4=')]
                opacity-10 z-0 pointer-events-none"></div>
  
        <div className="container px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto relative z-10">
          <div className={`flex flex-col gap-4 sm:gap-6 ${animate ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-2">
              <div>
               
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Your personal analytics and reading habits at a glance
                </p>
              </div>
              <div className="flex items-center text-xs bg-card/50 backdrop-blur-sm p-2 rounded-md border border-border/50">
                <span className="mr-2 text-muted-foreground">Last updated:</span>
                <span className="font-mono">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className="grid gap-3 sm:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-3">
              <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:shadow-hn-orange/10 hover:border-hn-orange/30">
                <div className="absolute inset-0 bg-gradient-to-br from-hn-orange/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between py-3 sm:pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium">Total Screen Time</CardTitle>
                  <div className="bg-hn-orange/10 p-1.5 rounded-full">
                    <Eye className="h-4 w-4 text-hn-orange" />
                  </div>
                </CardHeader>
                <CardContent className="py-0 sm:py-2 relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-xl sm:text-2xl font-bold">{totalScreenTime} hours</div>
                    <div className="text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full flex items-center">
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                      {screenTimeChange}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {timeRange === "weekly" ? "Past 7 days" : "Past 30 days"}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:shadow-blue-500/10 hover:border-blue-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between py-3 sm:pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                  <div className="bg-blue-500/10 p-1.5 rounded-full">
                    <Activity className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="py-0 sm:py-2 relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-xl sm:text-2xl font-bold">{averageDailyScreenTime} hours</div>
                    <div className="text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full flex items-center">
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                      {dailyAverageChange}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {timeRange === "weekly" ? "Past 7 days" : "Past 30 days"}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="group xs:col-span-2 md:col-span-1 overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:shadow-green-500/10 hover:border-green-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between py-3 sm:pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium">Articles Read</CardTitle>
                  <div className="bg-green-500/10 p-1.5 rounded-full">
                    <Newspaper className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="py-0 sm:py-2 relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-xl sm:text-2xl font-bold">{totalNewsRead}</div>
                    <div className="text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full flex items-center">
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                      {articlesReadChange}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Past 7 days</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md hover:shadow-hn-orange/10 transition-all duration-300 overflow-hidden">
                <CardHeader className="py-3 sm:py-4 border-b border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-lg">Screen Time</CardTitle>
                    <Tabs defaultValue="weekly" className="w-full sm:w-[200px]" onValueChange={setTimeRange}>
                      <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                        <TabsTrigger value="weekly" className="data-[state=active]:bg-hn-orange data-[state=active]:text-white">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly" className="data-[state=active]:bg-hn-orange data-[state=active]:text-white">Monthly</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <CardDescription className="mt-1.5">Your screen time over time</CardDescription>
                </CardHeader>
                <CardContent className="pl-0 sm:pl-2 h-60 sm:h-80 pt-6">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart data={getScreenTimeData()}>
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff6600" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ff6600" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis unit="h" tick={{ fontSize: 12 }} width={30} />
                      <Tooltip 
                        formatter={(value) => [`${value} hours`, 'Screen Time']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: 'none',
                          borderRadius: '4px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          color: '#fff'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="#ff6600" 
                        strokeWidth={2}
                        fill="url(#colorGradient)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">
                <CardHeader className="py-3 sm:py-4 border-b border-border/50">
                  <CardTitle className="text-lg">News Read</CardTitle>
                  <CardDescription className="mt-1.5">Number of articles read per day</CardDescription>
                </CardHeader>
                <CardContent className="pl-0 sm:pl-2 h-60 sm:h-80 pt-6">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <LineChart data={newsReadData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} width={30} />
                      <Tooltip 
                        formatter={(value) => [`${value} articles`, 'News Read']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: 'none',
                          borderRadius: '4px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          color: '#fff'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#0088fe" 
                        strokeWidth={2} 
                        name="News Read"
                        activeDot={{ r: 6, fill: '#0088fe', stroke: 'white', strokeWidth: 2 }}
                        dot={{ r: 4, fill: '#0088fe', stroke: 'white', strokeWidth: 1 }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md hover:shadow-green-500/10 transition-all duration-300 overflow-hidden">
              <CardHeader className="py-3 sm:py-4 border-b border-border/50">
                <CardTitle className="text-lg">Reading by Category</CardTitle>
                <CardDescription className="mt-1.5">Articles read by category</CardDescription>
              </CardHeader>
              <CardContent className="pl-0 h-64 sm:h-80 pt-6">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart
                    data={categoryData}
                    layout="vertical"
                    margin={{ top: 15, right: 15, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
                    <Tooltip 
                      formatter={(value) => [`${value} articles`, 'Articles Read']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: 'none',
                        borderRadius: '4px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        color: '#fff'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#00c49f" 
                      name="Articles Read"
                      radius={[0, 4, 4, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <div className="grid gap-3 sm:gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:shadow-purple-500/10 hover:border-purple-500/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between py-3 sm:pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium">Bookmarked Stories</CardTitle>
                  <div className="bg-purple-500/10 p-1.5 rounded-full">
                    <BookMarked className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent className="py-0 sm:py-2 relative z-10">
                  <div className="text-xl sm:text-2xl font-bold">24</div>
                  <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:shadow-amber-500/10 hover:border-amber-500/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between py-3 sm:pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium">Upvoted Stories</CardTitle>
                  <div className="bg-amber-500/10 p-1.5 rounded-full">
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent className="py-0 sm:py-2 relative z-10">
                  <div className="text-xl sm:text-2xl font-bold">87</div>
                  <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:shadow-rose-500/10 hover:border-rose-500/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between py-3 sm:pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium">Comments Made</CardTitle>
                  <div className="bg-rose-500/10 p-1.5 rounded-full">
                    <MessageSquare className="h-4 w-4 text-rose-500" />
                  </div>
                </CardHeader>
                <CardContent className="py-0 sm:py-2 relative z-10">
                  <div className="text-xl sm:text-2xl font-bold">36</div>
                  <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:shadow-cyan-500/10 hover:border-cyan-500/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between py-3 sm:pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                  <div className="bg-cyan-500/10 p-1.5 rounded-full">
                    <Zap className="h-4 w-4 text-cyan-500" />
                  </div>
                </CardHeader>
                <CardContent className="py-0 sm:py-2 relative z-10">
                  <div className="text-xl sm:text-2xl font-bold">12h 24m</div>
                  <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '52%' }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 