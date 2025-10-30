import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Target, Users, Award } from "lucide-react";
import teamImage from "@/assets/team-collaboration.jpg";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "We believe mental health should be accessible to everyone, providing tools with empathy and understanding."
    },
    {
      icon: Target,
      title: "Evidence-Based",
      description: "Our approach is grounded in scientific research and proven methodologies for stress management."
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Building a supportive community where individuals can share experiences and support each other."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in everything we do, continuously improving our platform and services."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              StressNet
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're on a mission to make mental health monitoring accessible, 
            comprehensive, and empowering for everyone.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="animate-slide-in">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                Mental health is just as important as physical health, yet it's often overlooked 
                or stigmatized. StressTracker was created to bridge this gap by providing 
                accessible, science-backed tools for monitoring and managing stress levels.
              </p>
              <p>
                Our platform empowers individuals to take control of their mental wellbeing 
                through real-time monitoring, insightful analytics, and personalized 
                recommendations that fit into their daily lives.
              </p>
              <p>
                We believe that when people have the right tools and support, they can 
                make meaningful improvements to their mental health and overall quality of life.
              </p>
            </div>
          </div>
          
          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-gradient-primary rounded-lg opacity-20 blur-3xl"></div>
            <img 
              src={teamImage} 
              alt="Professional team collaborating on mental health solutions"
              className="relative z-10 w-full h-auto rounded-lg shadow-elevated"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do and shape our approach to mental health technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="shadow-elevated border-card-border hover:shadow-glow transition-all duration-300 animate-scale-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <Card className="shadow-elevated border-card-border animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">The Story Behind StressTracker</CardTitle>
          </CardHeader>
          <CardContent className="max-w-4xl mx-auto">
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                StressTracker was born from a simple observation: while we have countless apps 
                for tracking our physical activities, sleep, and nutrition, there were few 
                comprehensive tools for monitoring our mental and emotional wellbeing.
              </p>
              <p>
                Our founding team, consisting of mental health professionals, software engineers, 
                and UX designers, came together with a shared vision of creating a platform 
                that would make stress monitoring as natural and routine as checking your 
                heart rate or step count.
              </p>
              <p>
                After extensive research and testing with mental health professionals and 
                everyday users, we developed a platform that combines scientific rigor 
                with intuitive design, making it easy for anyone to understand and improve 
                their mental health.
              </p>
              <p>
                Today, StressTracker serves thousands of users worldwide, helping them 
                build awareness, develop healthy coping strategies, and take proactive 
                steps toward better mental health.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;