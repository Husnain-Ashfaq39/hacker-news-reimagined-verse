import { Link, useNavigate } from "react-router-dom";
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
import { useState, useEffect, KeyboardEvent } from "react";
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
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useStoryIds, useStories } from "@/hooks/useHnQueries";
import { Story } from "@/services/hnService";
import { searchStories } from "@/services/searchService";
import { useHotkeys } from 'react-hotkeys-hook';

export function MainNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading, signOut, checkUserSession } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Story[]>([]);
  const navigate = useNavigate();
  
  // Fetch stories for search
  const { data: storyIds = [] } = useStoryIds("top");
  const { data: storiesData = [] } = useStories(storyIds.slice(0, 50) as number[], 50);
  
  // Keyboard shortcut to open search
  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault();
    setIsSearchOpen(true);
  });
  
  // Perform search when query changes
  useEffect(() => {
    if (!searchQuery.trim() || !storiesData.length) {
      setSearchResults([]);
      return;
    }
    
    const results = searchStories(storiesData as Story[], searchQuery);
    setSearchResults(results);
  }, [searchQuery, storiesData]);
  
  // Handle search input in regular search box
  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  // Handle navigation from command menu
  const handleSelectStory = (id: number) => {
    setIsSearchOpen(false);
    navigate(`/item/${id}`);
  };

  // Handle keypress in command input
  const handleCommandInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Update searchQuery when URL has a search parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [window.location.search]);

  return (
    <>
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
                to="/jobs"
                className="font-medium text-muted-foreground transition-colors hover:text-hn-orange"
              >
                Jobs
              </Link>
              
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stories... (Ctrl+K)"
                className="w-40 lg:w-64 pl-8 rounded-full bg-muted/50 focus-visible:ring-hn-orange"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                onClick={() => setIsSearchOpen(true)}
              />
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

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
      
      {/* Search Command Menu */}
      <CommandDialog 
        open={isSearchOpen} 
        onOpenChange={(open) => {
          setIsSearchOpen(open);
          if (!open) {
            // Reset only if not navigating directly to search page
            if (!searchQuery.trim() || !window.location.pathname.includes('/search')) {
              setSearchQuery('');
            }
          }
        }}
      >
        <CommandInput 
          placeholder="Search for stories, users, or tags..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
          onKeyDown={handleCommandInputKeyDown}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchResults.length > 0 && (
            <CommandGroup heading="Stories">
              {searchResults.slice(0, 10).map((story) => (
                <CommandItem
                  key={story.id}
                  onSelect={() => handleSelectStory(story.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm line-clamp-1">{story.title}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {story.domain && <span>{story.domain}</span>}
                      <span>by {story.user}</span>
                      <span>{story.points} points</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
              {searchResults.length > 10 && (
                <CommandItem 
                  onSelect={() => {
                    setIsSearchOpen(false);
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }}
                >
                  <span className="text-sm text-muted-foreground">See all {searchResults.length} results</span>
                </CommandItem>
              )}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
