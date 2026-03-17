"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import type { Generation } from "@/lib/types";
import { TEMPLATE_TYPES } from "@/lib/types";
import {
  ChevronDown,
  ChevronUp,
  Instagram,
  Facebook,
  Globe,
  Loader2,
} from "lucide-react";

export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const res = await fetch(`/api/history?page=${page}&limit=20`);
      const data = await res.json();
      setGenerations(data.generations);
      setTotal(data.total);
    } catch {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / 20);

  function getTemplateLabel(value: string) {
    return (
      TEMPLATE_TYPES.find((t) => t.value === value)?.label || value
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground mt-1">
          Your past content generations.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : generations.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">No generations yet. Head to the dashboard to create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {generations.map((gen) => (
            <Card key={gen.id}>
              <CardHeader
                className="cursor-pointer pb-3"
                onClick={() =>
                  setExpandedId(expandedId === gen.id ? null : gen.id)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">
                        {gen.specials_text.slice(0, 80)}
                        {gen.specials_text.length > 80 ? "..." : ""}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getTemplateLabel(gen.template_type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(gen.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  {expandedId === gen.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </CardHeader>

              {expandedId === gen.id && (
                <CardContent className="pt-0 space-y-4 border-t">
                  <div className="pt-4 space-y-4">
                    {gen.instagram_caption && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Instagram className="h-4 w-4 text-pink-500" />
                          Instagram
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {gen.instagram_caption}
                        </p>
                        {gen.instagram_hashtags &&
                          gen.instagram_hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {gen.instagram_hashtags.map((tag, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag.startsWith("#") ? tag : `#${tag}`}
                                </Badge>
                              ))}
                            </div>
                          )}
                        <CopyButton
                          text={`${gen.instagram_caption}\n\n${(gen.instagram_hashtags || []).map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")}`}
                          label="Copy Instagram"
                        />
                      </div>
                    )}

                    {gen.facebook_post && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Facebook className="h-4 w-4 text-blue-500" />
                          Facebook
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {gen.facebook_post}
                        </p>
                        <CopyButton
                          text={gen.facebook_post}
                          label="Copy Facebook"
                        />
                      </div>
                    )}

                    {gen.google_update && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Globe className="h-4 w-4 text-green-500" />
                          Google Business
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {gen.google_update}
                        </p>
                        <CopyButton
                          text={gen.google_update}
                          label="Copy Google"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
