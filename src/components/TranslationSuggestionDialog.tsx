import React, { useState } from "react";
import { MessageSquare, ExternalLink, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

interface TranslationSuggestionDialogProps {
  trigger?: React.ReactNode;
}

const TranslationSuggestionDialog = ({ trigger }: TranslationSuggestionDialogProps) => {
  const [formData, setFormData] = useState({
    discordUsername: "",
    mangaLink: "",
    reason: "",
    mangaTitle: "",
    language: "English"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset form and close dialog
    setFormData({
      discordUsername: "",
      mangaLink: "",
      reason: "",
      mangaTitle: "",
      language: "English"
    });
    setIsSubmitting(false);
    setIsOpen(false);
    
    // Show success message (in real app, use toast)
    alert("Translation suggestion submitted successfully! We'll review it and get back to you on Discord.");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-none border hover:bg-muted/50 transition-all duration-300"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>Suggest Translation</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border rounded-none">
        <DialogHeader className="border-b border-border/30 pb-4 mb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5" />
            Suggest a Translation
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Help us expand our manga library by suggesting translations
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="discord" className="text-sm font-medium">
              Discord Username *
            </Label>
            <Input
              id="discord"
              placeholder="YourUsername#1234"
              value={formData.discordUsername}
              onChange={(e) => handleInputChange("discordUsername", e.target.value)}
              required
              className="rounded-none border bg-background/50 focus:border-foreground/50 transition-colors"
            />
            <p className="text-xs text-muted-foreground">
              We'll contact you here for updates
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manga-title" className="text-sm font-medium">
              Manga Title *
            </Label>
            <Input
              id="manga-title"
              placeholder="Enter the manga title"
              value={formData.mangaTitle}
              onChange={(e) => handleInputChange("mangaTitle", e.target.value)}
              required
              className="rounded-none border bg-background/50 focus:border-foreground/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manga-link" className="text-sm font-medium">
              Manga Link *
            </Label>
            <div className="relative">
              <Input
                id="manga-link"
                placeholder="https://example.com/manga-source"
                value={formData.mangaLink}
                onChange={(e) => handleInputChange("mangaLink", e.target.value)}
                required
                type="url"
                className="rounded-none border bg-background/50 focus:border-foreground/50 transition-colors pr-10"
              />
              <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Link to the original manga source
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium">
              Target Language
            </Label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) => handleInputChange("language", e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-border rounded-none focus:border-foreground/50 focus:outline-none transition-colors"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Italian">Italian</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Why should we translate this? *
            </Label>
            <Textarea
              id="reason"
              placeholder="Tell us why this manga deserves a translation. Is it popular? Does it have an interesting story? Any special reasons?"
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              required
              rows={4}
              className="rounded-none border bg-background/50 focus:border-foreground/50 transition-colors resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Help us understand the value of this translation
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-none border border-border">
            <Badge variant="secondary" className="rounded-none bg-muted">
              Note
            </Badge>
            <p className="text-xs text-muted-foreground">
              Translation suggestions are reviewed by our team. Popular requests get priority!
            </p>
          </div>

          <div className="flex gap-3 pt-2 border-t border-border/30">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-none border"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.discordUsername || !formData.mangaLink || !formData.reason || !formData.mangaTitle}
              className="flex-1 rounded-none border bg-foreground text-background hover:bg-foreground/90"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Submit Suggestion
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TranslationSuggestionDialog;