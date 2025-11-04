import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
              <span className="text-2xl font-bold text-primary-foreground">UX</span>
            </div>
            <span className="text-xl font-semibold text-foreground">WEEKEND</span>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Want to learn?"
                className="pl-10 pr-32 h-12 rounded-full border-border"
              />
              <Button
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary hover:bg-primary/10"
              >
                Explore
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
              About us
            </a>
            <a href="#courses" className="text-muted-foreground hover:text-primary transition-colors">
              Courses
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact us
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">
              FAQ's
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Sign in
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
              Create free account
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
