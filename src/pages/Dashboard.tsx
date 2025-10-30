import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  fetchThingSpeakData,
  fetchUserThingSpeakData,
  saveThingSpeakReading,
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
  Database,
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
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"live" | "history">("history"); // Start with history mode
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [lastDataTimestamp, setLastDataTimestamp] = useState<number>(Date.now());

  // Refs to prevent duplicate calls
  const isFetchingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🧠 Smooth average filter
  const smoothAverage = (values: number[]): number => {
    if (values.length === 0) return 2506;
    const validValues = values.filter((v) => !isNaN(v) && v > 0);
    if (validValues.length === 0) return 2506;
    const avg = validValues.reduce((a, b) => a + b, 0) / validValues.length;
    return Math.round(avg);
  };

  // 🔴 Fetch LIVE data from ThingSpeak
  const updateLiveData = useCallback(async (showLoading = true) => {
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      if (showLoading) setIsDataLoading(true);
      
      const data: GSRFeed[] = await fetchThingSpeakData();
      
      if (!data || data.length === 0) {
        // No data received - start timeout to reset to zero
        console.log("⚠️ No data received from ThingSpeak");
        if (showLoading) setIsDataLoading(false);
        isFetchingRef.current = false;
        return;
      }

      // Data received successfully - update timestamp
      setLastDataTimestamp(Date.now());

      const values = data.map((feed) => Number(feed.field1) || 0);
      const dynamicBaseline = smoothAverage(values.slice(-5));
      setBaseline(dynamicBaseline);

      const formattedData = data.map((feed) => {
        const value = Number(feed.field1) || 0;
        return {
          date: new Date(feed.created_at).toLocaleTimeString(),
          stress: value,
          stressLevel: feed.stressLevel || "🟡 Moderate Stress",
        };
      });

      setStressData(formattedData);
      const latest = formattedData.at(-1);
      if (latest) setCurrentStress(latest.stress);
      
    } catch (err) {
      console.error("Failed to fetch live ThingSpeak data:", err);
      // On error, don't reset immediately - let timeout handle it
    } finally {
      if (showLoading) setIsDataLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // 🟢 Fetch USER's saved historical data
  const updateUserData = useCallback(async (userId: string, showLoading = true) => {
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      if (showLoading) setIsDataLoading(true);
      
      const data: GSRFeed[] = await fetchUserThingSpeakData(userId);
      
      if (!data || data.length === 0) {
        // No saved data - explicitly set to zero
        setCurrentStress(0);
        setStressData([]);
        setBaseline(2506);
        if (showLoading) setIsDataLoading(false);
        isFetchingRef.current = false;
        return;
      }

      const values = data.map((feed) => {
        const gsrValue = feed.field1 || (feed as any).gsr;
        return Number(gsrValue) || 0;
      });
      const dynamicBaseline = smoothAverage(values.slice(-5));
      setBaseline(dynamicBaseline);

      const formattedData = data.map((feed) => {
        const gsrValue = feed.field1 || (feed as any).gsr;
        const value = Number(gsrValue) || 0;
        const timestamp = feed.created_at || (feed as any).timestamp;
        
        return {
          date: new Date(timestamp).toLocaleTimeString(),
          stress: value,
          stressLevel: feed.stressLevel || "🟡 Moderate Stress",
        };
      });

      setStressData(formattedData);
      const latest = formattedData.at(-1);
      if (latest) setCurrentStress(latest.stress);
      
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      // On error, also set to zero
      setCurrentStress(0);
      setStressData([]);
    } finally {
      if (showLoading) setIsDataLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // 🧍‍♂️ Fetch user info (only once per user)
  const fetchUserInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, user needs to login");
        return;
      }

      const data = await fetchUserProfile(token);
      const userId = (data.id || data._id).toString();

      // Check if this is a new user
      const lastUserId = lastUserIdRef.current;
      
      if (lastUserId && lastUserId !== userId) {
        console.log("🔄 New user detected — clearing previous data");
        // Clear everything for new user
        setStressData([]);
        setCurrentStress(0);
        setBaseline(2506);
        setDataSource("history"); // Start new users with history mode showing zero
      }

      // Update refs
      lastUserIdRef.current = userId;
      setCurrentUserId(userId);
      localStorage.setItem("lastUserId", userId);

      setUserInfo(data);
      setNewOccupation(data.occupation || "");

    } catch (err) {
      console.error("Failed to fetch user info:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("lastUserId");
    }
  }, []);

  // ⏱️ Initial load - fetch user info only once
  useEffect(() => {
    fetchUserInfo();
  }, []); // Empty dependency array - runs once on mount

  // Load data when user or data source changes
  useEffect(() => {
    if (!currentUserId) return;

    // When switching to history mode, load user data
    if (dataSource === "live") {
      updateLiveData(true);
    } else {
      // Check if user has any saved data
      updateUserData(currentUserId, true);
    }
  }, [currentUserId, dataSource, updateLiveData, updateUserData]);

  // Polling for live data only (background updates without loading state)
  useEffect(() => {
    if (dataSource !== "live" || !currentUserId) return;

    const interval = setInterval(() => {
      updateLiveData(false); // Don't show loading during polling
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [dataSource, currentUserId, updateLiveData]);

  // ⏰ Hardware disconnect detection - reset to zero after 10 seconds of no data
  useEffect(() => {
    if (dataSource !== "live") return;

    // Check every second if hardware is disconnected
    const checkInterval = setInterval(() => {
      const timeSinceLastData = Date.now() - lastDataTimestamp;
      
      if (timeSinceLastData >= 10000) {
        console.log("⚠️ No data for 10 seconds - hardware disconnected. Resetting to zero.");
        setCurrentStress(0);
        setStressData([]);
      }
    }, 1000); // Check every second

    return () => {
      clearInterval(checkInterval);
    };
  }, [lastDataTimestamp, dataSource]);

  // 💾 Save current reading to user's history
  const handleSaveReading = async () => {
    if (!userInfo || currentStress === 0) {
      alert("No reading to save");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token");

      const userId = (userInfo.id || userInfo._id).toString();
      await saveThingSpeakReading(userId, currentStress, 0, token);
      
      alert("✅ Reading saved to your history!");
    } catch (err) {
      console.error("Error saving reading:", err);
      alert("❌ Failed to save reading");
    }
  };

  // 🔄 Toggle between live and history
  const toggleDataSource = () => {
    const newSource = dataSource === "live" ? "history" : "live";
    setDataSource(newSource);
  };

  // 💼 Handle occupation update
  const handleOccupationSave = async () => {
    if (!userInfo) return;
    try {
      const res = await fetch(
        `https://stressnet-backend-1.onrender.com/api/users/updateOccupation/${userInfo.id || userInfo._id}`,
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

  // 📊 CSV Export
  const exportToCSV = () => {
    if (stressData.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["Date", "GSR Value", "Stress Level", "User", "Source"];
    const rows = stressData.map(({ date, stress, stressLevel }) => [
      date,
      stress,
      stressLevel,
      userInfo?.username || "Unknown",
      dataSource === "live" ? "Live ThingSpeak" : "User History"
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stress_data_${userInfo?.username || 'user'}_${dataSource}_${new Date().toISOString().split('T')[0]}.csv`;
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Stress Level Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor and track your stress levels for better mental health
              </p>
            </div>
            {/* Data Source Toggle */}
            <Button
              variant="outline"
              onClick={toggleDataSource}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {dataSource === "live" ? "📡 Live Data" : "💾 My History"}
            </Button>
          </div>
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
              <CardDescription>
                {dataSource === "live" ? "Live from ThingSpeak" : "Your Latest"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-3">
              {isDataLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : currentStress === 0 && dataSource === "history" && stressData.length === 0 ? (
                <div className="text-center">
                  <StressCircle value={0} />
                  <p className="text-sm text-muted-foreground mt-4">No saved readings yet</p>
                </div>
              ) : currentStress === 0 && dataSource === "live" ? (
                <div className="text-center">
                  <StressCircle value={0} />
                  <p className="text-sm text-red-500 mt-4">⚠️ Hardware Disconnected</p>
                </div>
              ) : (
                <>
                  <StressCircle value={currentStress} />
                  {dataSource === "live" && currentStress > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveReading}
                      className="mt-4"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save to My History
                    </Button>
                  )}
                </>
              )}
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
                    <p>{userInfo ? userInfo.occupation || "Not set" : "Loading..."}</p>
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
                  {userInfo?.lastLogin
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
              Stress History - {dataSource === "live" ? "Live Feed" : "My Saved Data"}
            </CardTitle>
            <CardDescription>
              {dataSource === "live" 
                ? "Real-time data from ThingSpeak sensor" 
                : "Your personal stress tracking history"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isDataLoading ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">Loading stress data...</p>
              </div>
            ) : stressData.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">
                  {dataSource === "live" 
                    ? "⚠️ No live data available - Check hardware connection" 
                    : "No saved readings yet. Switch to Live Data and save readings!"}
                </p>
              </div>
            ) : (
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
                      fill={dataSource === "live" ? "hsl(var(--primary))" : "hsl(142, 76%, 36%)"}
                      radius={[6, 6, 0, 0]}
                      barSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
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
            disabled={stressData.length === 0}
          >
            <TrendingUp className="mr-2 h-5 w-5" /> Export Data (CSV)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;