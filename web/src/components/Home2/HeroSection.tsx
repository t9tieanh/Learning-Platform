import { Button } from "@/components/ui/button";
import { GraduationCap, Video, Users } from "lucide-react";
// import heroStudent from "@/assets/hero-student.jpg";
import anh from '@/assets/images/banner.jpg'

const HeroSection = () => {
    return (
        <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute top-20 left-10 w-96 h-96 border-2 border-primary/10 rounded-full" />
            <div className="absolute bottom-20 right-20 w-32 h-32 bg-primary/5 rounded-full" />
            <div className="absolute top-40 right-40 w-16 h-16 bg-accent/20 rounded-full" />

            <div className="container mx-auto px-4 py-16 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary rounded-full" />
                        </div>

                        <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                            Up Your <span className="text-primary">Skills</span>
                            <br />
                            To <span className="text-primary">Advance</span> Your
                            <br />
                            <span className="text-primary">Career</span> Path
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-lg">
                            Learn UI-UX Design skills with weekend UX. The latest online learning system and material that help your knowledge growing.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-14 text-lg">
                                Get Started
                            </Button>
                            <Button variant="ghost" size="lg" className="text-primary hover:text-primary hover:bg-primary/10 h-14 text-lg">
                                Get free trial
                            </Button>
                        </div>
                    </div>

                    {/* Right Content - Hero Image with Stats */}
                    <div className="relative flex items-center justify-center">
                        {/* Main Circle Background */}
                        <div className="absolute w-[500px] h-[500px] lg:w-[600px] lg:h-[600px] bg-primary rounded-full" />

                        {/* Green Accent Circle */}
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary rounded-full" />

                        {/* Student Image */}
                        <div className="relative w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] rounded-full overflow-hidden border-8 border-background shadow-2xl">
                            <img
                                src={anh}
                                alt="Happy student"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Stat Cards */}
                        <div className="absolute top-32 left-0 bg-card p-4 rounded-xl shadow-lg border border-border animate-float">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Video className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-foreground">2K+</div>
                                    <div className="text-sm text-muted-foreground">Video Courses</div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-20 right-0 bg-card p-4 rounded-2xl shadow-lg border border-border animate-float-delayed">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <GraduationCap className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-foreground">5K+</div>
                                    <div className="text-sm text-muted-foreground">Online Courses</div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-20 right-0 bg-card p-4 rounded-2xl shadow-lg border border-border animate-float-slow">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-foreground">Tutors</div>
                                    <div className="text-3xl font-bold text-foreground">250+</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
