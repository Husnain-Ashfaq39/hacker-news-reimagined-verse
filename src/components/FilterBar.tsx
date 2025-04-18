import { ChevronDown, Filter, Clock, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterBarProps {
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
  onTimeChange: (time: string) => void;
  activeCategory?: string;
}

export function FilterBar({ 
  onFilterChange, 
  onSortChange, 
  onTimeChange,
  activeCategory = "all" 
}: FilterBarProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeSort, setActiveSort] = useState("top");
  const [activeTime, setActiveTime] = useState("today");
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };
  
  const handleSortChange = (sort: string) => {
    setActiveSort(sort);
    onSortChange(sort);
  };
  
  const handleTimeChange = (time: string) => {
    setActiveTime(time);
    onTimeChange(time);
  };
  
  const sortOptions = [
    { id: "top", label: "Top", icon: <ThumbsUp className="h-4 w-4 mr-2" /> },
    { id: "new", label: "New", icon: <Clock className="h-4 w-4 mr-2" /> },
  ];
  
  const timeFilters = [
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "year", label: "This Year" },
  ];
  
  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {activeCategory === 'all' ? 'All Stories' : 
           activeCategory === 'ask' ? 'Ask HN' :
           activeCategory === 'show' ? 'Show HN' :
           activeCategory === 'jobs' ? 'Jobs' : 'Latest Stories'}
        </h2>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center text-xs h-8"
              >
                <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                {sortOptions.find(s => s.id === activeSort)?.label}
                <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {sortOptions.map(option => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => handleSortChange(option.id)}
                  className="flex items-center text-sm"
                >
                  {option.icon}
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center text-xs h-8"
              >
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                Filter
                <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <div className="p-2 text-xs font-medium text-muted-foreground">Time</div>
              {timeFilters.map(filter => (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => handleTimeChange(filter.id)}
                  className="text-sm"
                >
                  {filter.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
