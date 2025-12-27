import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plus, Download, Copy, Trash2, LogOut, Image as ImageIcon, FileText } from "lucide-react";
import { api } from "@shared/routes";
import type { Item, CreateItemRequest } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<Item | null>(null);
  const [contentType, setContentType] = useState<"text" | "image">("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) {
      setLocation("/login");
    }
  }, [token, setLocation]);

  const { data: items = [] } = useQuery({
    queryKey: ["/api/items"],
    queryFn: async () => {
      const response = await fetch("/api/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch items");
      return response.json() as Promise<Item[]>;
    },
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateItemRequest) => {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(error.message || "Failed to create item");
      }
      return response.json() as Promise<Item>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      toast({ title: "Item added", description: "Your content has been saved." });
      setIsAddDialogOpen(false);
      setTitle("");
      setContent("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(error.message || "Failed to delete item");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      setViewingItem(null);
      toast({ title: "Item deleted" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }
    await createMutation.mutateAsync({
      type: contentType,
      title,
      content,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setContent(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyText = () => {
    if (viewingItem?.type === "text") {
      navigator.clipboard.writeText(viewingItem.content);
      toast({ title: "Copied to clipboard" });
    }
  };

  const handleDownloadImage = () => {
    if (viewingItem?.type === "image") {
      const link = document.createElement("a");
      link.href = viewingItem.content;
      link.download = `${viewingItem.title}.jpg`;
      link.click();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b sticky top-0 z-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Gallery</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              variant="default"
              size="sm"
              data-testid="button-add-content"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items yet. Add your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setViewingItem(item)}
                className="cursor-pointer rounded-lg overflow-hidden border hover:shadow-lg transition-shadow bg-card"
                data-testid={`card-item-${item.id}`}
              >
                {item.type === "text" ? (
                  <div className="p-4 h-40 flex flex-col">
                    <h3 className="font-semibold truncate">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-4">
                      {item.content}
                    </p>
                  </div>
                ) : (
                  <div className="relative w-full h-40 bg-muted overflow-hidden">
                    <img
                      src={item.content}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                      <p className="text-white text-sm font-medium truncate">
                        {item.title}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Content Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Content</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={contentType === "text" ? "default" : "outline"}
                onClick={() => {
                  setContentType("text");
                  setContent("");
                }}
                size="sm"
                className="flex-1"
                data-testid="button-type-text"
              >
                <FileText className="w-4 h-4 mr-2" />
                Text
              </Button>
              <Button
                variant={contentType === "image" ? "default" : "outline"}
                onClick={() => {
                  setContentType("image");
                  setContent("");
                }}
                size="sm"
                className="flex-1"
                data-testid="button-type-image"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Image
              </Button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-title"
              />

              {contentType === "text" ? (
                <Textarea
                  placeholder="Your text content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-32"
                  data-testid="input-content-text"
                />
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Image URL</label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={
                        content.startsWith("data:") ? "" : content
                      }
                      onChange={(e) => setContent(e.target.value)}
                      data-testid="input-image-url"
                    />
                  </div>
                  <div className="text-center text-sm text-muted-foreground">or</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    data-testid="input-image-upload"
                  />
                  {content.startsWith("data:") && (
                    <div className="text-sm text-green-600">
                      Image uploaded successfully
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-save-item"
                >
                  {createMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Item Dialog */}
      <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
        <DialogContent className="max-w-2xl">
          {viewingItem && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingItem.title}</DialogTitle>
              </DialogHeader>

              {viewingItem.type === "text" ? (
                <div className="space-y-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {viewingItem.content}
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={handleCopyText}
                      size="sm"
                      data-testid="button-copy-text"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() =>
                        deleteMutation.mutate(viewingItem.id)
                      }
                      variant="destructive"
                      size="sm"
                      data-testid="button-delete-item"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <img
                    src={viewingItem.content}
                    alt={viewingItem.title}
                    className="w-full rounded-lg"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={handleDownloadImage}
                      size="sm"
                      data-testid="button-download-image"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() =>
                        deleteMutation.mutate(viewingItem.id)
                      }
                      variant="destructive"
                      size="sm"
                      data-testid="button-delete-item"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
