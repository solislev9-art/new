import React, { useState } from "react";
import {
  Search,
  X,
  Filter,
  SlidersHorizontal,
  Mic,
  Camera,
  History,
  Bookmark,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";

interface SearchResult {
  id: string;
  title: string;
  coverImage: string;
}

interface Genre {
  id: string;
  name: string;
}

interface SearchFilters {
  sortBy: "relevance" | "rating" | "popularity" | "newest" | "oldest";
  minRating: number;
  status: "all" | "ongoing" | "completed" | "hiatus";
  year: string;
  adultContent: boolean;
}

interface SearchSectionProps {
  onSearch?: (query: string, filters?: SearchFilters) => void;
  onGenreSelect?: (genreId: string) => void;
  results?: SearchResult[];
  genres?: Genre[];
  onVoiceSearch?: () => void;
  onImageSearch?: () => void;
  searchHistory?: string[];
}

const SearchSection = ({
  onSearch = () => {},
  onGenreSelect = () => {},
  onVoiceSearch = () => {},
  onImageSearch = () => {},
  results = [
    {
      id: "1",
      title: "My Life Turned Around After Being Cheated on and Falsely Accused",
      coverImage:
        "src/components/images/manga/My Life Turned Around After Being Cheated on and Falsely Accused/ch1/01.webp",
    },
    {
      id: "2",
      title: "Naruto",
      coverImage:
        "https://images.unsplash.com/photo-1541562232579-512a21360020?w=200&q=80",
    },
    {
      id: "3",
      title: "Attack on Titan",
      coverImage:
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200&q=80",
    },
  ],
  genres = [
    { id: "1", name: "Action" },
    { id: "2", name: "Adventure" },
    { id: "3", name: "Comedy" },
    { id: "4", name: "Drama" },
    { id: "5", name: "Fantasy" },
    { id: "6", name: "Horror" },
    { id: "7", name: "Mystery" },
    { id: "8", name: "Romance" },
    { id: "9", name: "Sci-Fi" },
    { id: "10", name: "Slice of Life" },
  ],
  searchHistory = ["One Piece", "Naruto", "Attack on Titan"],
}: SearchSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: "relevance",
    minRating: 0,
    status: "all",
    year: "all",
    adultContent: false,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(query.length > 0);
    setShowHistory(query.length === 0);
    onSearch(query, filters);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
    setShowHistory(false);
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
    onGenreSelect(genreId);
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    setShowHistory(false);
    setShowResults(true);
    onSearch(query, filters);
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    if (searchQuery) {
      onSearch(searchQuery, updatedFilters);
    }
  };

  return (
<div className="w-full bg-background p-6 border-b border-border">
  <div className="max-w-6xl mx-auto">
    <div className="relative mb-6">
      <div className="relative flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Discover your next favorite manga..."
            className="pl-12 pr-24 h-12 text-base w-full"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => {
              if (searchQuery.length > 0) {
                setShowResults(true);
              } else {
                setShowHistory(true);
              }
            }}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-destructive/20 transition-all duration-300"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>


            {/* Advanced Filters */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium leading-none">Advanced Filters</h4>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort by</label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: any) =>
                        updateFilters({ sortBy: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="popularity">Popularity</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Minimum Rating: {filters.minRating}
                    </label>
                    <Slider
                      value={[filters.minRating]}
                      onValueChange={([value]) =>
                        updateFilters({ minRating: value })
                      }
                      max={5}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={filters.status}
                      onValueChange={(value: any) =>
                        updateFilters({ status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="hiatus">On Hiatus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Publication Year
                    </label>
                    <Select
                      value={filters.year}
                      onValueChange={(value) => updateFilters({ year: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                        <SelectItem value="2020">2020</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-md shadow-lg z-20 max-h-80 overflow-auto">
              {results.length > 0 ? (
                <ul className="py-3">
                  {results.map((result) => (
                    <li
                      key={result.id}
                      className="px-4 py-3 hover:bg-accent flex items-center gap-3 cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/manga/${result.id}`)
                      }
                    >
                      <img
                        src={result.coverImage}
                        alt={result.title}
                        className="h-12 w-10 object-cover rounded"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-foreground">
                          {result.title}
                        </span>
                        <div className="text-sm text-muted-foreground mt-1">
                          Manga
                        </div>
                      </div>
                      <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No results found</p>
                  <p className="text-sm mt-1">Try different keywords</p>
                </div>
              )}
            </div>
          )}

          {/* Search History Dropdown */}
          {showHistory && searchHistory.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-20 max-h-60 overflow-auto">
              <div className="p-2 border-b">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <History className="h-4 w-4" />
                  <span>Recent Searches</span>
                </div>
              </div>
              <ul className="py-2">
                {searchHistory.map((query, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-accent flex items-center gap-3 cursor-pointer"
                    onClick={() => handleHistoryClick(query)}
                  >
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span>{query}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Genre Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Genres</span>
            </div>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-3 overflow-x-auto">
              {genres.map((genre) => (
                <Badge
                  key={genre.id}
                  variant={
                    selectedGenres.includes(genre.id) ? "default" : "secondary"
                  }
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => toggleGenre(genre.id)}
                >
                  {genre.name}
                  {selectedGenres.includes(genre.id) && (
                    <span className="ml-1 text-xs">✓</span>
                  )}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
