import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  Bell,
  User,
  LogOut,
  Activity,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Login3 } from "@/components/Login";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MainNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading, signOut, checkUserSession } = useAuthStore();
  


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
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-hn-orange text-white font-bold h-7 w-7 rounded flex items-center justify-center">
              HN
            </div>
            <span className="hidden sm:inline-block font-semibold text-lg">
              Hacker News
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm">
            <Link
              to="/"
              className="font-medium transition-colors hover:text-hn-orange"
            >
              Home
            </Link>
            <Link
              to="/newest"
              className="font-medium text-muted-foreground transition-colors hover:text-hn-orange"
            >
              New
            </Link>
            <Link
              to="/ask"
              className="font-medium text-muted-foreground transition-colors hover:text-hn-orange"
            >
              Ask
            </Link>
            <Link
              to="/show"
              className="font-medium text-muted-foreground transition-colors hover:text-hn-orange"
            >
              Show
            </Link>
            <Link
              to="/jobs"
              className="font-medium text-muted-foreground transition-colors hover:text-hn-orange"
            >
              Jobs
            </Link>
            <Link
              to="/dashboard"
              className="font-medium text-muted-foreground transition-colors hover:text-hn-orange"
            >
              Dashboard
            </Link>
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

          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="hidden md:flex" aria-label="Dashboard">
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          </Link>

          <ThemeToggle />

          {!isLoading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.profile_url}
                          alt={user.name}
                        />
                        <AvatarFallback>
                          {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">
                        <Activity className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="hidden md:flex bg-hn-orange hover:bg-hn-orange/90">
                      Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader />
                    <Login3
                      heading="Welcome"
                      subheading="Continue with Google"
                      googleText="Continue with Google"
                      logo={{
                        url: "#",
                        src: "https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg",
                        alt: "Logo",
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
