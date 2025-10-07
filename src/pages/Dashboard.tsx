import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StressCircle from "@/components/StressCircle";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { User, Mail, Briefcase, Clock, TrendingUp, Activity, Heart } from "lucide-react";

const Dashboard = () => {
  // CSV export function
  const exportToCSV = () => {
    const headers = ["Date", "Stress Level"];
    const rows = stressData.map(row => [row.date, row.stress]);
    const csvContent = [headers, ...rows]
      .map(e => e.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "stress_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // Mock data for stress history
  const stressData = [
    { date: "2025-09-18", stress: 65 },
    { date: "2025-09-19", stress: 72 },
    { date: "2025-09-20", stress: 85 },
    { date: "2025-09-21", stress: 78 },
    { date: "2025-09-22", stress: 90 },
    { date: "2025-09-23", stress: 68 },
  ];

  const currentStress = 90;
  const userInfo = {
    name: "Selva Pradeep E",
    email: "ABC@gmail.com",
    occupation: "Software Developer",
    lastLogin: "2 hours ago"
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Stress Level Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and track your stress levels for better mental health
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Stress Level */}
          <Card className="lg:col-span-1 shadow-elevated border-card-border animate-scale-in">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Current Stress
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <StressCircle value={currentStress} />
            </CardContent>
          </Card>

          {/* User Info */}
          <Card className="lg:col-span-2 shadow-elevated border-card-border animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name:</p>
                    <p className="font-medium">{userInfo.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email:</p>
                    <p className="font-medium">{userInfo.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation:</p>
                    <p className="font-medium">{userInfo.occupation}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login:</p>
                    <p className="font-medium">{userInfo.lastLogin}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stress History Chart */}
        <Card className="shadow-elevated border-card-border animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Stress History
            </CardTitle>
            <CardDescription>
              Track your stress levels over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar 
                    dataKey="stress" 
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-16 bg-gradient-primary text-white border-0 hover:bg-gradient-primary/90"
          >
            <Heart className="mr-2 h-5 w-5" />
            Track Current Mood
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 bg-gradient-secondary text-white border-0 hover:bg-gradient-secondary/90"
          >
            <Activity className="mr-2 h-5 w-5" />
            View Analytics
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 border-primary text-primary hover:bg-primary hover:text-white"
            onClick={exportToCSV}
          >
            <TrendingUp className="mr-2 h-5 w-5" />
            Export Data (CSV)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;