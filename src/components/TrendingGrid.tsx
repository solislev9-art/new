import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import cover01 from "./images/front/1.webp";
import { Button } from "@/components/ui/button";
import {
  Star,
  BookOpen,
  Plus,
  ChevronDown,
  Heart,
  Check,
  Grid3X3,
  List,
  Filter,
  SortAsc,
  Eye,
  Clock,
  Bookmark,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  saveMangaToLibrary,
  removeMangaFromLibrary,
  isMangaInLibrary,
  getReadingProgress,
  addToReadingHistory,
} from "@/lib/library";

interface MangaItem {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  rating: number;
  genres: string[];
  totalChapters?: number;
  latestChapter?: {
    number: number;
    addedDays: number;
  };
}

interface TrendingGridProps {
  items?: MangaItem[];
  onLoadMore?: () => void;
  onAddToLibrary?: (id: string) => void;
  onReadNow?: (id: string) => void;
  onShare?: (id: string) => void;
  title?: string;
  showLoadMore?: boolean;
  viewMode?: "grid" | "list";
  sortBy?: "title" | "rating" | "popularity" | "newest";
  filterBy?: string[];
  showProgress?: boolean;
}

const TrendingGrid = ({
  items = [
    {
      id: "2",
      title: "Demon Slayer",
      author: "Koyoharu Gotouge",
      coverImage:
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
      rating: 4.7,
      genres: ["Action", "Supernatural"],
      totalChapters: 205,
      latestChapter: { number: 205, addedDays: 2 },
    },
    {
      id: "3",
      title: "Jujutsu Kaisen",
      author: "Gege Akutami",
      coverImage:
        "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=400&q=80",
      rating: 4.9,
      genres: ["Action", "Horror"],
      totalChapters: 248,
      latestChapter: { number: 248, addedDays: 1 },
    },
    {
      id: "4",
      title: "My Hero Academia",
      author: "Kohei Horikoshi",
      coverImage:
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&q=80",
      rating: 4.6,
      genres: ["Superhero", "School"],
      totalChapters: 410,
      latestChapter: { number: 410, addedDays: 4 },
    },
    {
      id: "5",
      title: "Attack on Titan",
      author: "Hajime Isayama",
      coverImage:
        "https://images.unsplash.com/photo-1612036782180-6f0822045d55?w=400&q=80",
      rating: 4.9,
      genres: ["Dark Fantasy", "Post-Apocalyptic"],
      totalChapters: 139,
      latestChapter: { number: 139, addedDays: 30 },
    },
    {
      id: "6",
      title: "Chainsaw Man",
      author: "Tatsuki Fujimoto",
      coverImage:
        "https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=400&q=80",
      rating: 4.8,
      genres: ["Action", "Horror"],
      totalChapters: 152,
      latestChapter: { number: 152, addedDays: 7 },
    },
    {
      id: "7",
      title: "Spy x Family",
      author: "Tatsuya Endo",
      coverImage:
        "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80",
      rating: 4.7,
      genres: ["Comedy", "Action"],
      totalChapters: 95,
      latestChapter: { number: 95, addedDays: 3 },
    },
    {
      id: "8",
      title: "Tokyo Revengers",
      author: "Ken Wakui",
      coverImage:
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
      rating: 4.5,
      genres: ["Action", "Drama"],
      totalChapters: 278,
      latestChapter: { number: 278, addedDays: 14 },
    },
  ],
  onLoadMore = () => console.log("Load more"),
  onAddToLibrary = (id) => console.log("Add to library", id),
  onReadNow = (id) => console.log("Read now", id),
  onShare = (id) => console.log("Share", id),
  title = "Trending Now",
  showLoadMore = true,
  viewMode = "grid",
  sortBy = "popularity",
  filterBy = [],
  showProgress = true,
}: TrendingGridProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [savedMangas, setSavedMangas] = useState<Set<string>>(new Set());
  const [currentViewMode, setCurrentViewMode] = useState<"grid" | "list">(
    viewMode,
  );
  const [currentSort, setCurrentSort] = useState<"title" | "rating" | "popularity" | "newest">(sortBy);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check which mangas are already saved
    const saved = new Set<string>();
    items.forEach((item) => {
      if (isMangaInLibrary(item.id)) {
        saved.add(item.id);
      }
    });
    setSavedMangas(saved);
  }, [items]);

  const handleAddToLibrary = (item: MangaItem) => {
    const isCurrentlySaved = savedMangas.has(item.id);

    if (isCurrentlySaved) {
      const success = removeMangaFromLibrary(item.id);
      if (success) {
        setSavedMangas((prev) => {
          const newSet = new Set(prev);
          newSet.delete(item.id);
          return newSet;
        });
      }
    } else {
      const success = saveMangaToLibrary({
        id: item.id,
        title: item.title,
        author: item.author,
        coverImage: item.coverImage,
        rating: item.rating,
        genres: item.genres,
      });
      if (success) {
        setSavedMangas((prev) => new Set([...prev, item.id]));
      }
    }

    onAddToLibrary(item.id);
  };

  const handleReadNow = (item: MangaItem) => {
    // Add to reading history
    addToReadingHistory({
      mangaId: item.id,
      title: item.title,
      coverImage: item.coverImage,
      lastChapter: 1,
      lastPage: 1,
      readingTime: 0,
    });
    // Navigate directly to reader for better UX
    window.location.href = `/reader/${item.id}/1`;
    onReadNow(item.id);
  };

  const getReadingProgressForManga = (mangaId: string) => {
    const progress = getReadingProgress(mangaId);
    if (!progress) return null;
    return (progress.currentChapter / progress.totalChapters) * 100;
  };

  const handleSortChange = (value: string) => {
    if (value === "title" || value === "rating" || value === "popularity" || value === "newest") {
      setCurrentSort(value);
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    switch (currentSort) {
      case "title":
        return a.title.localeCompare(b.title);
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return b.id.localeCompare(a.id); // Assuming newer items have higher IDs
      default:
        return 0;
    }
  });

  return (
    <div className="w-full bg-background py-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-border rounded-md">
              <Button
                variant={currentViewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4 text-current" />
              </Button>
              <Button
                variant={currentViewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4 text-current" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <Select value={currentSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-32">
                <SortAsc className="h-4 w-4 mr-2 text-current" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popular</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
        </div>

        <TooltipProvider>
          <div
            className={
              currentViewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                : "space-y-4"
            }
          >
            <AnimatePresence>
              {sortedItems.map((item) => {
                const readingProgress = showProgress
                  ? getReadingProgressForManga(item.id)
                  : null;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: currentViewMode === "grid" ? -5 : 0 }}
                    className={`relative ${currentViewMode === "list" ? "w-full" : ""}`}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Card
                      className={`overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
                        currentViewMode === "list"
                          ? "flex flex-row h-32"
                          : "h-full"
                      }`}
                      onClick={() =>
                        (window.location.href = `/manga/${item.id}`)
                      }
                    >
                      <div
                        className={`relative overflow-hidden ${
                          currentViewMode === "list"
                            ? "w-24 h-full"
                            : "aspect-[3/4]"
                        }`}
                      >
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110"
                        />

                        {/* Reading Progress Bar */}
                        {readingProgress !== null && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${readingProgress}%` }}
                            />
                          </div>
                        )}

                        {/* Quick Actions */}
                        <motion.div
                          className="absolute top-2 right-2 z-10 flex flex-col gap-1"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: hoveredItem === item.id ? 1 : 0.7,
                            scale: hoveredItem === item.id ? 1.1 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => handleAddToLibrary(item)}
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 rounded-full ${
                                  savedMangas.has(item.id)
                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                    : "bg-black/50 hover:bg-black/70 text-white"
                                }`}
                              >
                                {savedMangas.has(item.id) ? (
                                  <Heart className="h-4 w-4 fill-current" />
                                ) : (
                                  <Heart className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {savedMangas.has(item.id)
                                ? "Remove from Library"
                                : "Add to Library"}
                            </TooltipContent>
                          </Tooltip>

                          {hoveredItem === item.id && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const url = `${window.location.origin}/manga/${item.id}`;
                                      navigator.clipboard
                                        .writeText(url)
                                        .then(() => {
                                          console.log(
                                            "Link copied to clipboard",
                                          );
                                        });
                                      onShare(item.id);
                                    }}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Share</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </motion.div>

                        {/* Overlay with actions that appear on hover */}
                        {currentViewMode === "grid" && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                              opacity: hoveredItem === item.id ? 1 : 0,
                              y: hoveredItem === item.id ? 0 : 20,
                            }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          >
                            <div className="flex flex-col gap-3">
                              <Button
                                onClick={() => handleReadNow(item)}
                                className="w-full"
                                size="sm"
                              >
                                <BookOpen className="mr-2 h-4 w-4" /> Read Now
                              </Button>
                              <Button
                                onClick={() => handleAddToLibrary(item)}
                                variant={
                                  savedMangas.has(item.id)
                                    ? "destructive"
                                    : "outline"
                                }
                                className={`w-full ${
                                  savedMangas.has(item.id)
                                    ? ""
                                    : "text-white border-white/50 hover:bg-white/10"
                                }`}
                                size="sm"
                              >
                                {savedMangas.has(item.id) ? (
                                  <>
                                    <Check className="mr-2 h-4 w-4" /> In
                                    Library
                                  </>
                                ) : (
                                  <>
                                    <Plus className="mr-2 h-4 w-4" /> Add to
                                    Library
                                  </>
                                )}
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <CardContent
                        className={`${currentViewMode === "list" ? "flex-1 p-4" : "p-3"}`}
                      >
                        <div
                          className={`flex ${currentViewMode === "list" ? "justify-between items-center" : "flex-col space-y-1"}`}
                        >
                          <div
                            className={
                              currentViewMode === "list" ? "flex-1" : ""
                            }
                          >
                            <h3
                              className={`font-semibold line-clamp-1 ${
                                currentViewMode === "list"
                                  ? "text-base mb-1"
                                  : "text-sm"
                              }`}
                            >
                              {item.title}
                            </h3>
                            <p
                              className={`text-muted-foreground ${
                                currentViewMode === "list"
                                  ? "text-sm mb-2"
                                  : "text-xs"
                              }`}
                            >
                              {item.author}
                            </p>
                            <div className="flex items-center mt-1">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                              <span className="text-xs text-foreground">
                                {item.rating}
                              </span>
                              {item.totalChapters && (
                                <>
                                  <span className="mx-2 text-muted-foreground">
                                    •
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {item.totalChapters} chapters
                                  </span>
                                </>
                              )}
                              {readingProgress !== null && (
                                <>
                                  <span className="mx-2 text-muted-foreground">
                                    •
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round(readingProgress)}% read
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {item.genres
                                .slice(0, currentViewMode === "list" ? 3 : 2)
                                .map((genre) => (
                                  <Badge
                                    key={genre}
                                    variant="secondary"
                                    className="text-[10px] px-2 py-0"
                                  >
                                    {genre}
                                  </Badge>
                                ))}
                            </div>

                            {/* Latest Chapter Info */}
                            {item.latestChapter && (
                              <div className="flex items-center mt-2 pt-2 border-t border-primary/20">
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-2 py-0"
                                  >
                                    Ch. {item.latestChapter.number}
                                  </Badge>
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {item.latestChapter.addedDays === 1
                                      ? "1 day ago"
                                      : `${item.latestChapter.addedDays} days ago`}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {currentViewMode === "list" && (
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                onClick={() => handleReadNow(item)}
                                size="sm"
                              >
                                <BookOpen className="mr-2 h-4 w-4 text-current" />{" "}
                                Read
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <ChevronDown className="h-4 w-4 text-current" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleAddToLibrary(item)}
                                  >
                                    {savedMangas.has(item.id) ? (
                                      <>
                                        <Check className="mr-2 h-4 w-4 text-current" />{" "}
                                        In Library
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="mr-2 h-4 w-4 text-current" />{" "}
                                        Add to Library
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const url = `${window.location.origin}/manga/${item.id}`;
                                      navigator.clipboard
                                        .writeText(url)
                                        .then(() => {
                                          console.log(
                                            "Link copied to clipboard",
                                          );
                                        });
                                      onShare(item.id);
                                    }}
                                  >
                                    <Share2 className="mr-2 h-4 w-4 text-current" />{" "}
                                    Share
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Bookmark className="mr-2 h-4 w-4 text-current" />{" "}
                                    Bookmark
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </TooltipProvider>

        {showLoadMore && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={onLoadMore}
              variant="outline"
              className="flex items-center gap-2"
            >
              Load More <ChevronDown className="h-4 w-4 text-current" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingGrid;