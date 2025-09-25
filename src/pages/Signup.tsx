import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import wellnessImage from "@/assets/wellness-illustration.jpg";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate signup process
    setTimeout(() => {
      if (name && email && password) {
        toast({
          title: "Account created successfully!",
          description: "Welcome to StressTracker. Redirecting to dashboard...",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Signup failed",
          description: "Please fill in all fields and try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <Card className="shadow-elevated border-card-border animate-fade-in overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left side - Illustration integrated into card */}
            <div className="hidden md:flex justify-center items-center p-8 bg-gradient-secondary/5">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-0 bg-gradient-secondary rounded-full opacity-20 blur-3xl animate-pulse-glow"></div>
                <img 
                  src={wellnessImage} 
                  alt="Peaceful wellness illustration for mental health journey"
                  className="relative z-10 w-full h-auto animate-scale-in rounded-lg"
                />
              </div>
            </div>

            {/* Right side - Signup form */}
            <div className="p-8">
              <CardHeader className="space-y-1 text-center px-0 pb-6">
                <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Sign Up
                </CardTitle>
                <CardDescription>
                  Join us and start tracking your stress levels effectively.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:bg-gradient-primary/90 transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link 
                      to="/login" 
                      className="text-primary hover:text-primary-dark transition-colors font-medium"
                    >
                      Login
                    </Link>
                  </div>
                </form>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;