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
  AlertCircle,
  X,
  Wind,
  Coffee,
  Music,
  Flower2,
  Moon,
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
  const [dataSource, setDataSource] = useState<"live" | "history">("history");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [lastDataTimestamp, setLastDataTimestamp] = useState<number>(Date.now());
  
  // Stress warning states
  const [showRelaxationModal, setShowRelaxationModal] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(0);

  // Refs to prevent duplicate calls
  const isFetchingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate stress percentage
  const calculateStressPercent = (value: number): number => {
    if (value === 0) return 0;
    const diff = baseline - value;
    if (diff > 0) return Math.min(100, (diff / baseline) * 100);
    return 0;
  };

  const currentStressPercent = calculateStressPercent(currentStress);
  const isHighStress = currentStressPercent > 70;
  const isModerateStress = currentStressPercent > 40 && currentStressPercent <= 70;
  const showWarning = currentStressPercent > 40 && currentStress > 0;

  // Breathing animation cycle
  useEffect(() => {
    if (!showRelaxationModal) return;

    const cycle = () => {
      setBreathingPhase('inhale');
      setTimeout(() => setBreathingPhase('hold'), 4000);
      setTimeout(() => setBreathingPhase('exhale'), 8000);
      setTimeout(() => {
        setBreathCount(prev => prev + 1);
      }, 12000);
    };

    cycle();
    const interval = setInterval(cycle, 12000);
    return () => clearInterval(interval);
  }, [showRelaxationModal]);

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
        console.log("⚠️ No data received from ThingSpeak");
        if (showLoading) setIsDataLoading(false);
        isFetchingRef.current = false;
        return;
      }

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

      const lastUserId = lastUserIdRef.current;
      
      if (lastUserId && lastUserId !== userId) {
        console.log("🔄 New user detected — clearing previous data");
        setStressData([]);
        setCurrentStress(0);
        setBaseline(2506);
        setDataSource("history");
      }

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

  // ⏱️ Initial load
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Load data when user or data source changes
  useEffect(() => {
    if (!currentUserId) return;

    if (dataSource === "live") {
      updateLiveData(true);
    } else {
      updateUserData(currentUserId, true);
    }
  }, [currentUserId, dataSource, updateLiveData, updateUserData]);

  // Polling for live data only
  useEffect(() => {
    if (dataSource !== "live" || !currentUserId) return;

    const interval = setInterval(() => {
      updateLiveData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [dataSource, currentUserId, updateLiveData]);

  // ⏰ Hardware disconnect detection
  useEffect(() => {
    if (dataSource !== "live") return;

    const checkInterval = setInterval(() => {
      const timeSinceLastData = Date.now() - lastDataTimestamp;
      
      if (timeSinceLastData >= 10000) {
        console.log("⚠️ No data for 10 seconds - hardware disconnected. Resetting to zero.");
        setCurrentStress(0);
        setStressData([]);
      }
    }, 1000);

    return () => {
      clearInterval(checkInterval);
    };
  }, [lastDataTimestamp, dataSource]);

  // 💾 Save current reading
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

  const relaxationTips = [
    { icon: <Wind className="h-5 w-5" />, title: "Deep Breathing", desc: "Take slow, deep breaths for 5 minutes" },
    { icon: <Coffee className="h-5 w-5" />, title: "Take a Break", desc: "Step away from your work for 10 minutes" },
    { icon: <Music className="h-5 w-5" />, title: "Listen to Music", desc: "Play calming music or nature sounds" },
    { icon: <Flower2 className="h-5 w-5" />, title: "Stretch", desc: "Do gentle stretches to release tension" },
    { icon: <Moon className="h-5 w-5" />, title: "Mindfulness", desc: "Practice 5 minutes of meditation" },
    { icon: <Heart className="h-5 w-5" />, title: "Connect", desc: "Talk to a friend or loved one" },
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Stress Warning Banner */}
      {showWarning && (
        <div 
          className={`fixed top-0 left-0 right-0 z-50 ${
            isHighStress ? 'bg-red-500' : 'bg-yellow-500'
          } text-white shadow-lg animate-slide-down`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 animate-pulse" />
              <div>
                <p className="font-semibold">
                  {isHighStress ? '⚠️ High Stress Detected!' : '⚠️ Elevated Stress Level'}
                </p>
                <p className="text-sm opacity-90">
                  Your stress level is at {currentStressPercent}%. Time to take care of yourself.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRelaxationModal(true)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Show Relaxation Tips
            </button>
          </div>
        </div>
      )}

      {/* Relaxation Modal */}
      {showRelaxationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Take a Moment to Relax 🧘‍♀️</h2>
                  <p className="text-blue-100">Your well-being matters. Let's reduce that stress together.</p>
                </div>
                <button
                  onClick={() => setShowRelaxationModal(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Breathing Exercise */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Wind className="h-5 w-5 text-blue-500" />
                  Guided Breathing Exercise
                </h3>
                
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div 
                      className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 shadow-lg transition-all duration-[4000ms] ease-in-out ${
                        breathingPhase === 'inhale' ? 'scale-150' : 
                        breathingPhase === 'hold' ? 'scale-150' : 
                        'scale-100'
                      }`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-lg capitalize">{breathingPhase}</span>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-gray-700 font-medium">
                      {breathingPhase === 'inhale' && '🌬️ Breathe in slowly through your nose (4 seconds)'}
                      {breathingPhase === 'hold' && '⏸️ Hold your breath gently (4 seconds)'}
                      {breathingPhase === 'exhale' && '😮‍💨 Exhale slowly through your mouth (4 seconds)'}
                    </p>
                    <p className="text-sm text-gray-500">Completed cycles: {breathCount}</p>
                  </div>
                </div>
              </div>

              {/* Quick Tips Grid */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Relaxation Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relaxationTips.map((tip, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow hover:border-blue-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                          {tip.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{tip.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{tip.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Support */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">💡 Remember:</span> If you're experiencing persistent high stress, 
                  consider talking to a mental health professional or counselor.
                </p>
              </div>

              <button
                onClick={() => setShowRelaxationModal(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                I Feel Better Now 😊
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${showWarning ? 'pt-24' : ''}`}>
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

      <style>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;