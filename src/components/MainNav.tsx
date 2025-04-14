
import { Link } from "react-router-dom";
import { 
  Menu, X, Search, Bell, 
  TrendingUp, Terminal, Bookmark, 
  Users, BarChart, Coffee
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";

export function MainNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-hn-orange text-white font-bold h-7 w-7 rounded flex items-center justify-center">
              HN
            </div>
            <span className="hidden sm:inline-block font-semibold text-lg">Hacker News</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-5 text-sm">
            <Link to="/" className="font-medium transition-colors hover:text-hn-orange">Home</Link>
            <Link to="/newest" className="font-medium text-muted-foreground transition-colors hover:text-hn-orange">New</Link>
            <Link to="/ask" className="font-medium text-muted-foreground transition-colors hover:text-hn-orange">Ask</Link>
            <Link to="/show" className="font-medium text-muted-foreground transition-colors hover:text-hn-orange">Show</Link>
            <Link to="/jobs" className="font-medium text-muted-foreground transition-colors hover:text-hn-orange">Jobs</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stories..."
              className="w-40 lg:w-64 pl-8 rounded-full bg-muted/50 focus-visible:ring-hn-orange"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell className="h-5 w-5" />
          </Button>
          
          <ThemeToggle />
          
          <Button className="hidden md:flex bg-hn-orange hover:bg-hn-orange/90">
            Sign In
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={cn(
        "md:hidden fixed inset-0 top-16 bg-background border-t z-40 transition-transform duration-300 ease-in-out",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="container py-4 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stories..."
              className="w-full pl-8 rounded-full bg-muted/50 focus-visible:ring-hn-orange"
            />
          </div>
          
          <nav className="flex flex-col gap-1">
            <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted">
              <TrendingUp className="h-4 w-4" />
              <span>Top Stories</span>
            </Link>
            <Link to="/newest" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted">
              <Terminal className="h-4 w-4" />
              <span>New Stories</span>
            </Link>
            <Link to="/ask" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted">
              <Users className="h-4 w-4" />
              <span>Ask HN</span>
            </Link>
            <Link to="/show" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted">
              <Coffee className="h-4 w-4" />
              <span>Show HN</span>
            </Link>
            <Link to="/jobs" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted">
              <BarChart className="h-4 w-4" />
              <span>Jobs</span>
            </Link>
            <Link to="/saved" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted">
              <Bookmark className="h-4 w-4" />
              <span>Saved</span>
            </Link>
          </nav>
          
          <div className="mt-auto pt-4 border-t">
            <Button className="w-full bg-hn-orange hover:bg-hn-orange/90">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
