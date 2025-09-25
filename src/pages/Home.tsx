import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Activity, TrendingUp, Shield, Users, BarChart3 } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Track your stress levels in real-time with our advanced analytics system."
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Visualize your mental health journey with detailed charts and insights."
    },
    {
      icon: Shield,
      title: "Privacy Focused",
      description: "Your data is encrypted and secure. We prioritize your privacy above all."
    },
    {
      icon: BarChart3,
      title: "Detailed Reports",
      description: "Get comprehensive reports to share with healthcare professionals."
    },
    {
      icon: Heart,
      title: "Personal Dashboard",
      description: "Access your personalized stress monitoring dashboard anytime, anywhere."
    },
    {
      icon: Users,
      title: "Data Export",
      description: "Export your stress tracking data for personal records or analysis."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
  <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Take Control of Your{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Mental Health
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Monitor, track, and improve your stress levels with our comprehensive 
              mental health dashboard. Get insights that matter and build better habits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-gradient-primary hover:bg-gradient-primary/90 text-white px-8 py-3 text-lg"
              >
                <Link to="/signup">
                  <Heart className="mr-2 h-5 w-5" />
                  Start Your Journey
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline" 
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 text-lg"
              >
                <Link to="/login">
                  Already have an account?
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
  {/* Background shapes removed for a cleaner look */}
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose StressTracker?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform provides comprehensive tools to help you understand and manage your stress levels effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="shadow-elevated border-card-border hover:shadow-glow transition-all duration-300 animate-scale-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
  <section className="py-20 px-4 bg-gray-100 text-primary">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of users who have taken control of their mental health with StressTracker.
          </p>
          <Button 
            asChild
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90 px-8 py-3 text-lg"
          >
            <Link to="/signup">
              Get Started Today
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;