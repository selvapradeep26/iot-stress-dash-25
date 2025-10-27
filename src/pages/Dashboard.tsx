import React, { useEffect, useState, useCallback } from "react";
import {
  fetchThingSpeakData,
  fetchUserProfile,
  GSRFeed,
  UserProfile,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StressCircle from "@/components/StressCircle";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  User,
  Mail,
  Briefcase,
  Clock,
  TrendingUp,
  Activity,
  Heart,
  Save,
  Edit3,
} from "lucide-react";

interface StressData {
  date: string;
  stress: number;
  stressLevel: string;
}

const Dashboard: React.FC = () => {
  const [stressData, setStressData] = useState<StressData[]>([]);
  const [currentStress, setCurrentStress] = useState<number>(0);
  const [baseline, setBaseline] = useState<number>(2506);
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [editingOccupation, setEditingOccupation] = useState(false);
  const [newOccupation, setNewOccupation] = useState("");

  // Smooth average filter
  const smoothAverage = useCallback(
    (values: number[]): number => {
      if (values.length === 0) return baseline;
      const validValues = values.filter((v) => !isNaN(v));
      if (validValues.length === 0) return baseline;
      const avg = validValues.reduce((a, b) => a + b, 0) / validValues.length;
      return Math.round(avg);
    },
    [baseline]
  );

  // Fetch ThingSpeak data
  const updateData = useCallback(async () => {
    try {
      const data: GSRFeed[] = await fetchThingSpeakData();
      if (!data || data.length === 0) {
        setCurrentStress(0);
        return;
      }

      const values = data.map((feed) => Number(feed.field1) || 0);
      const dynamicBaseline = smoothAverage(values.slice(-5));
      setBaseline(dynamicBaseline);

      const formattedData = data.map((feed) => {
        const value = Number(feed.field1) || 0;
        let stressLevel = "🟢 Relaxed";
        if (value < dynamicBaseline - 150) stressLevel = "🔴 High Stress";
        else if (value < dynamicBaseline - 50) stressLevel = "🟡 Moderate Stress";

        return {
          date: new Date(feed.created_at).toLocaleTimeString(),
          stress: value,
          stressLevel,
        };
      });

      setStressData(formattedData);
      const latest = formattedData.at(-1);
      if (latest) setCurrentStress(latest.stress);
    } catch (err) {
      console.error("Failed to fetch ThingSpeak data:", err);
      setCurrentStress(0);
    }
  }, [smoothAverage]);

  // Fetch user info
  const fetchUserInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const data = await fetchUserProfile(token);
      setUserInfo(data);
      setNewOccupation(data.occupation || "");
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  }, []);

  useEffect(() => {
    updateData();
    fetchUserInfo();
    const interval = setInterval(updateData, 10000);
    return () => clearInterval(interval);
  }, [updateData, fetchUserInfo]);

  // Handle occupation update
  const handleOccupationSave = async () => {
    if (!userInfo) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/users/updateOccupation/${userInfo.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ occupation: newOccupation }),
        }
      );

      if (!res.ok) throw new Error("Failed to update occupation");

      const result = await res.json();
      setUserInfo(result.user);
      setEditingOccupation(false);
    } catch (err) {
      console.error("Occupation update error:", err);
    }
  };

  // CSV Export
  const exportToCSV = () => {
    const headers = ["Date", "GSR Value", "Stress Level"];
    const rows = stressData.map(({ date, stress, stressLevel }) => [
      date,
      stress,
      stressLevel,
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stress_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Stress Level Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and track your stress levels for better mental health
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Stress */}
          <Card className="lg:col-span-1 shadow-elevated border-card-border animate-scale-in">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Current Stress
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-3">
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
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground" />
                <p>{userInfo ? userInfo.username : "Loading..."}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground" />
                <p>{userInfo ? userInfo.email : "Loading..."}</p>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="text-muted-foreground" />
                {editingOccupation ? (
                  <div className="flex gap-2">
                    <input
                      value={newOccupation}
                      onChange={(e) => setNewOccupation(e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleOccupationSave}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p>{userInfo ? userInfo.occupation : "Loading..."}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingOccupation(true)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground" />
                <p>
                  Last login:{" "}
                  {userInfo
                    ? new Date(userInfo.lastLogin).toLocaleString()
                    : "Loading..."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stress Chart */}
        <Card className="shadow-elevated border-card-border animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Stress History
            </CardTitle>
            <CardDescription>
              Track your stress levels over recent readings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stressData} barCategoryGap={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      value,
                      props.payload.stressLevel,
                    ]}
                  />
                  <Bar
                    dataKey="stress"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                    barSize={28}
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
            <Heart className="mr-2 h-5 w-5" /> Track Current Mood
          </Button>
          <Button
            variant="outline"
            className="h-16 bg-gradient-secondary text-white border-0 hover:bg-gradient-secondary/90"
          >
            <Activity className="mr-2 h-5 w-5" /> View Analytics
          </Button>
          <Button
            variant="outline"
            className="h-16 border-primary text-primary hover:bg-primary hover:text-white"
            onClick={exportToCSV}
          >
            <TrendingUp className="mr-2 h-5 w-5" /> Export Data (CSV)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
