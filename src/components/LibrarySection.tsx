import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  BookOpen,
  Trash2,
  Library,
  Search,
  SortAsc,
  Filter,
  Grid3X3,
  List,
  Upload,
  BarChart3,
  Clock,
  TrendingUp,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUserLibrary,
  removeMangaFromLibrary,
  getLibraryStats,
  SavedManga,
  sortLibrary,
  filterLibraryByGenre,
  searchLibrary,
  exportLibrary,
  importLibrary,
  getReadingHistory,
  getReadingProgress,
} from "@/lib/library";

interface LibrarySectionProps {
  onReadNow?: (id: string) => void;
}

const LibrarySection = ({
  onReadNow = (id) => console.log("Read now", id),
}: LibrarySectionProps) => {
  const [library, setLibrary] = useState<SavedManga[]>([]);
  const [filteredLibrary, setFilteredLibrary] = useState<SavedManga[]>([]);
  const [stats, setStats] = useState({
    totalMangas: 0,
    recentlyAdded: [] as SavedManga[],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "title" | "author" | "rating" | "dateAdded"
  >("dateAdded");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("library");
  const [readingHistory, setReadingHistory] = useState<any[]>([]);

  useEffect(() => {
    loadLibrary();
    loadReadingHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [library, searchQuery, sortBy, sortOrder, selectedGenre]);

  const loadLibrary = () => {
    const userLibrary = getUserLibrary();
    setLibrary(userLibrary.mangas);
    setStats(getLibraryStats());
  };

  const loadReadingHistory = () => {
    const history = getReadingHistory();
    setReadingHistory(history);
  };

  const applyFilters = () => {
    let filtered = [...library];

    // Apply search filter
    if (searchQuery) {
      filtered = searchLibrary(searchQuery);
    }

    // Apply genre filter
    if (selectedGenre !== "all") {
      filtered = filtered.filter((manga) =>
        manga.genres.some(
          (genre) => genre.toLowerCase() === selectedGenre.toLowerCase(),
        ),
      );
    }

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "author":
          comparison = a.author.localeCompare(b.author);
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "dateAdded":
          comparison =
            new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    setFilteredLibrary(filtered);
  };

  const handleRemoveFromLibrary = (mangaId: string) => {
    const success = removeMangaFromLibrary(mangaId);
    if (success) {
      loadLibrary();
    }
  };

  const handleExportLibrary = () => {
    const data = exportLibrary();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manga-library-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportLibrary = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        const success = importLibrary(data);
        if (success) {
          loadLibrary();
          loadReadingHistory();
        }
      };
      reader.readAsText(file);
    }
  };

  const getUniqueGenres = () => {
    const genres = new Set<string>();
    library.forEach((manga) => {
      manga.genres.forEach((genre) => genres.add(genre));
    });
    return Array.from(genres).sort();
  };

  const getReadingProgressForManga = (mangaId: string) => {
    const progress = getReadingProgress(mangaId);
    if (!progress) return null;
    return (progress.currentChapter / progress.totalChapters) * 100;
  };

  const EmptyLibraryCard = () => (
    <Card className="text-center py-12">
      <CardContent>
        <Library className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Your Library is Empty</h3>
        <p className="text-muted-foreground mb-4">
          Start building your manga collection by adding your favorite titles!
        </p>
        <p className="text-sm text-muted-foreground">
          Look for the heart icon on any manga to save it to your library.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full bg-background py-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Library className="h-6 w-6" />
              My Library
            </h2>
            <p className="text-muted-foreground">
              {stats.totalMangas} manga{stats.totalMangas !== 1 ? "s" : ""}{" "}
              saved
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Library className="h-4 w-4" />
              Library ({stats.totalMangas})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              History ({readingHistory.length})
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-6">
            {library.length === 0 ? (
              <EmptyLibraryCard />
            ) : (
              <>
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search your library..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select
                      value={selectedGenre}
                      onValueChange={setSelectedGenre}
                    >
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genres</SelectItem>
                        {getUniqueGenres().map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={`${sortBy}-${sortOrder}`}
                      onValueChange={(value) => {
                        const [sort, order] = value.split("-") as [
                          typeof sortBy,
                          typeof sortOrder,
                        ];
                        setSortBy(sort);
                        setSortOrder(order);
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SortAsc className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dateAdded-desc">
                          Recently Added
                        </SelectItem>
                        <SelectItem value="dateAdded-asc">
                          Oldest First
                        </SelectItem>
                        <SelectItem value="title-asc">Title A-Z</SelectItem>
                        <SelectItem value="title-desc">Title Z-A</SelectItem>
                        <SelectItem value="rating-desc">
                          Highest Rated
                        </SelectItem>
                        <SelectItem value="rating-asc">Lowest Rated</SelectItem>
                        <SelectItem value="author-asc">Author A-Z</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center border rounded-md">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-r-none"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-l-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Library Grid/List */}
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6"
                      : "space-y-4"
                  }
                >
                  <AnimatePresence>
                    {filteredLibrary.map((manga, index) => {
                      const readingProgress = getReadingProgressForManga(
                        manga.id,
                      );

                      return (
                        <motion.div
                          key={manga.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`relative group ${viewMode === "list" ? "w-full" : ""}`}
                        >
                          <Card
                            className={`overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow ${
                              viewMode === "list"
                                ? "flex flex-row h-32"
                                : "h-full"
                            }`}
                          >
                            <div
                              className={`relative overflow-hidden ${
                                viewMode === "list"
                                  ? "w-24 h-full"
                                  : "aspect-[3/4]"
                              }`}
                            >
                              <img
                                src={manga.coverImage}
                                alt={manga.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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

                              {/* Remove button */}
                              <motion.div
                                className="absolute top-2 right-2 z-10"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Button
                                  onClick={() =>
                                    handleRemoveFromLibrary(manga.id)
                                  }
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full bg-red-500/90 hover:bg-red-600/90 text-white backdrop-blur-sm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </motion.div>

                              {/* Overlay with read button */}
                              {viewMode === "grid" && (
                                <motion.div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <Button
                                    onClick={() => onReadNow(manga.id)}
                                    size="sm"
                                  >
                                    <BookOpen className="mr-2 h-4 w-4" /> Read
                                    Now
                                  </Button>
                                </motion.div>
                              )}
                            </div>

                            <CardContent
                              className={`${viewMode === "list" ? "flex-1 p-4" : "p-3"}`}
                            >
                              <div
                                className={`flex ${viewMode === "list" ? "justify-between items-center" : "flex-col space-y-1"}`}
                              >
                                <div
                                  className={
                                    viewMode === "list" ? "flex-1" : ""
                                  }
                                >
                                  <h3
                                    className={`font-semibold line-clamp-1 ${
                                      viewMode === "list"
                                        ? "text-base mb-1"
                                        : "text-sm"
                                    }`}
                                  >
                                    {manga.title}
                                  </h3>
                                  <p
                                    className={`text-muted-foreground ${
                                      viewMode === "list"
                                        ? "text-sm mb-2"
                                        : "text-xs"
                                    }`}
                                  >
                                    {manga.author}
                                  </p>
                                  <div className="flex items-center mt-1">
                                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                                    <span className="text-xs">
                                      {manga.rating}
                                    </span>
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
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {manga.genres
                                      .slice(0, viewMode === "list" ? 3 : 2)
                                      .map((genre) => (
                                        <Badge
                                          key={genre}
                                          variant="secondary"
                                          className="text-[10px] px-1 py-0"
                                        >
                                          {genre}
                                        </Badge>
                                      ))}
                                  </div>
                                  {viewMode === "grid" && (
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                      Added{" "}
                                      {new Date(
                                        manga.savedAt,
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>

                                {viewMode === "list" && (
                                  <div className="flex items-center gap-2 ml-4">
                                    <Button
                                      onClick={() => onReadNow(manga.id)}
                                      size="sm"
                                    >
                                      <BookOpen className="mr-2 h-4 w-4" /> Read
                                    </Button>
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
              </>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {readingHistory.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Reading History
                  </h3>
                  <p className="text-muted-foreground">
                    Your reading history will appear here as you read manga.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {readingHistory.map((item, index) => (
                  <motion.div
                    key={`${item.mangaId}-${item.readAt}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-base mb-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Chapter {item.lastChapter}, Page {item.lastPage}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                Read{" "}
                                {new Date(item.readAt).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span>{item.readingTime} min read</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => onReadNow(item.mangaId)}
                            size="sm"
                          >
                            <BookOpen className="mr-2 h-4 w-4" /> Continue
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Library className="h-5 w-5" />
                    Total Manga
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalMangas}</div>
                  <p className="text-sm text-muted-foreground">
                    In your library
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Reading Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {readingHistory.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total sessions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Reading Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {readingHistory.reduce(
                      (total, item) => total + item.readingTime,
                      0,
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Minutes read</p>
                </CardContent>
              </Card>
            </div>

            {stats.recentlyAdded.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recently Added</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentlyAdded.map((manga) => (
                      <div key={manga.id} className="flex items-center gap-3">
                        <img
                          src={manga.coverImage}
                          alt={manga.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{manga.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {manga.author}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Added {new Date(manga.savedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-1" />
                          <span className="text-sm">{manga.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LibrarySection;
