import { Mic, Briefcase, Lightbulb } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Mic,
      title: "Public Speaking",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: Briefcase,
      title: "Career-Oriented",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Lightbulb,
      title: "Creative Thinking",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex flex-wrap justify-center gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`p-3 rounded-xl ${feature.bgColor}`}>
                <Icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <span className="font-medium text-foreground">{feature.title}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;
