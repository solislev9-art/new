import React, { useState } from "react";
import {
  Library,
  TrendingUp,
  BarChart3,
  Shield,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import cover01 from "./images/front/1.webp";
import TrendingGrid from "./TrendingGrid";
import SearchSection from "./SearchSection";
import LibrarySection from "./LibrarySection";
import TranslationSuggestionDialog from "./TranslationSuggestionDialog";
import BackgroundEffects from "./BackgroundEffects";
import { getMangaList, convertToFrontendFormat } from "@/lib/upload";
import { useNavigate } from "react-router-dom";
import { getCurrentRegularUser, isUserAuthenticated, userLogout } from "@/lib/auth";

const Home = () => {
  const [activeTab, setActiveTab] = useState("trending");
  const navigate = useNavigate();
  const currentUser = getCurrentRegularUser();

  const handleLogout = () => {
    userLogout();
    window.location.reload(); // Refresh to update UI
  };

  // Get uploaded manga and convert to frontend format
  const uploadedManga = getMangaList().map(convertToFrontendFormat);

  // Data for different time periods - only includes uploaded manga
  const getMangaByPeriod = (period: string) => {
    // Use uploaded manga for all periods
    switch (period) {
      case "trending":
        return uploadedManga.slice(0, 7); // Limit to 7 for trending
      case "all":
        return uploadedManga;
      default:
        return uploadedManga.slice(0, 7); // Default to 7 for other periods
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark relative">
      {/* Background Effects */}
      <BackgroundEffects />
      
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <span className="text-2xl font-bold">
                MangaVerse
              </span>
            </div>

            {/* Navigation Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium rounded-none border border-transparent hover:border-border hover:bg-muted/50 transition-all duration-300"
                onClick={() => setActiveTab("trending")}
              >
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium rounded-none border border-transparent hover:border-border hover:bg-muted/50 transition-all duration-300"
                onClick={() => {
                  // Navigate to bookmarked section
                  const bookmarkedSection =
                    document.getElementById("library-section");
                  bookmarkedSection?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Bookmarked
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium rounded-none border border-transparent hover:border-border hover:bg-muted/50 transition-all duration-300"
                onClick={() => {
                  // Navigate to currently reading section
                  const librarySection =
                    document.getElementById("library-section");
                  librarySection?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Currently Reading
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium rounded-none border border-transparent hover:border-border hover:bg-muted/50 transition-all duration-300"
                onClick={() => setActiveTab("all")}
              >
                All Mangas
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                {/* User Menu */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Welcome, {currentUser.username}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 rounded-none border border-transparent hover:border-border hover:bg-muted/50 transition-all duration-300"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>

                {/* Sign Up Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 rounded-none border border-border hover:bg-muted/50 transition-all duration-300"
                  onClick={() => navigate("/signup")}
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Up</span>
                </Button>
              </>
            )}

            {/* Admin Login Button */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 rounded-none border border-border hover:bg-muted/50 transition-all duration-300"
              onClick={() => navigate("/admin/login")}
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
            
            {/* Translation Suggestion Button */}
            <TranslationSuggestionDialog />
          </div>
        </div>
      </header>
      
      <main className="container py-6 space-y-8 relative z-10">
        {/* Search Section */}
        <div className="transform hover:scale-[1.01] transition-transform duration-300 border border-border/30 bg-muted/10 p-4">
          <SearchSection />
        </div>

        {/* Manga Lists with Tabs */}
        <section className="transform hover:scale-[1.002] transition-transform duration-300 border border-border/30 bg-muted/10 p-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-8 border-b border-border/30 pb-4">
              <h2 className="text-3xl font-bold">
                Discover Manga
              </h2>
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-background/50 backdrop-blur-sm rounded-none border">
                <TabsTrigger
                  value="trending"
                  className="flex items-center gap-1 rounded-none data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all duration-300"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Trending</span>
                </TabsTrigger>
                <TabsTrigger
                  value="today"
                  className="flex items-center gap-1 rounded-none data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all duration-300"
                >
                  <Library className="h-4 w-4" />
                  <span className="hidden sm:inline">Today</span>
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="flex items-center gap-1 rounded-none data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all duration-300"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">All</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="trending">
              <TrendingGrid
                title="Trending Now"
                items={getMangaByPeriod("trending")}
                showLoadMore={true}
              />
            </TabsContent>

            <TabsContent value="today">
              <TrendingGrid
                title="Popular Today"
                items={getMangaByPeriod("today")}
                showLoadMore={false}
              />
            </TabsContent>

            <TabsContent value="all">
              <TrendingGrid
                title="All Time Popular"
                items={getMangaByPeriod("all")}
                showLoadMore={true}
              />
            </TabsContent>
          </Tabs>
        </section>

        {/* Library Section */}
        <section id="library-section" className="transform hover:scale-[1.002] transition-transform duration-300 border border-border/30 bg-muted/10 p-4">
          <LibrarySection />
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border bg-background/80 backdrop-blur-sm py-6 md:py-0 relative z-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm leading-loose text-muted-foreground">
              © 2025 LumoraScans. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              All the comics on this website are only previews of the original comics, there may be many language errors, character names, and story lines. For the original version, please buy the comic if it's available in your city.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="rounded-none border border-transparent hover:border-border hover:bg-muted/50 transition-all duration-300">
              Terms
            </Button>
            <Button variant="ghost" size="sm" className="rounded-none border border-transparent hover:border-border hover:bg-muted/50 transition-all duration-300">
              Privacy
            </Button>
            <Button variant="ghost" size="sm" className="rounded-none border border-transparent hover:border-border hover:bg-muted/50 transition-all duration-300">
              Contact
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;