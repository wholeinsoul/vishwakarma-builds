"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { RejectionReport } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Plus,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  bankId: string;
  bankName: string;
}

interface ReportWithVotes extends RejectionReport {
  upvotes: number;
  downvotes: number;
  userVote?: "up" | "down" | null;
}

export function RejectionReports({ bankId, bankName }: Props) {
  const supabase = createClient();
  const [reports, setReports] = useState<ReportWithVotes[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    rejection_reason: "",
    details: "",
    poa_type: "durable",
  });

  const loadReports = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);

    // FIXED: Single query with join instead of N+1
    const { data: repsData } = await supabase
      .from("rejection_reports")
      .select(`
        *,
        rejection_votes (
          vote_type,
          user_id
        )
      `)
      .eq("bank_id", bankId)
      .order("created_at", { ascending: false });

    if (!repsData) return;

    // Calculate vote counts from joined data (no additional queries)
    const reportsWithVotes: ReportWithVotes[] = repsData.map((r: unknown) => {
      const report = r as { rejection_votes?: Array<{ vote_type: string; user_id: string }> } & Omit<ReportWithVotes, 'upvotes' | 'downvotes' | 'userVote'>;
      const votes = report.rejection_votes || [];
      const upvotes = votes.filter((v) => v.vote_type === "up").length;
      const downvotes = votes.filter((v) => v.vote_type === "down").length;
      const userVote = user
        ? (votes.find((v) => v.user_id === user.id)?.vote_type as
            | "up"
            | "down"
            | undefined) ?? null
        : null;

      return {
        ...report,
        upvotes,
        downvotes,
        userVote,
      };
    });

    setReports(reportsWithVotes);
  }, [supabase, bankId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleVote = async (reportId: string, voteType: "up" | "down") => {
    if (!userId) return;

    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    try {
      let result;
      if (report.userVote === voteType) {
        // Remove vote
        result = await supabase
          .from("rejection_votes")
          .delete()
          .eq("report_id", reportId)
          .eq("user_id", userId);
      } else if (report.userVote) {
        // Change vote
        result = await supabase
          .from("rejection_votes")
          .update({ vote_type: voteType })
          .eq("report_id", reportId)
          .eq("user_id", userId);
      } else {
        // New vote
        result = await supabase.from("rejection_votes").insert({
          report_id: reportId,
          user_id: userId,
          vote_type: voteType,
        });
      }

      if (result.error) {
        console.error("Vote error:", result.error);
        alert("Failed to record vote. Please try again.");
        return;
      }

      loadReports();
    } catch (error) {
      console.error("Vote error:", error);
      alert("Failed to record vote. Please try again.");
    }
  };

  const handleSubmitReport = async () => {
    if (!userId || !form.rejection_reason.trim()) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from("rejection_reports").insert({
        user_id: userId,
        bank_id: bankId,
        rejection_reason: form.rejection_reason,
        details: form.details || null,
        poa_type: form.poa_type,
      });

      if (error) {
        console.error("Submit report error:", error);
        alert("Failed to submit report. Please try again.");
        setSubmitting(false);
        return;
      }

      setForm({ rejection_reason: "", details: "", poa_type: "durable" });
      setDialogOpen(false);
      setSubmitting(false);
      loadReports();
    } catch (error) {
      console.error("Submit report error:", error);
      alert("Failed to submit report. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-navy-700 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-500" />
            Community Rejection Reports
          </h2>
          <p className="text-sm text-navy-400">
            Learn from others&apos; experiences with {bankName}
          </p>
        </div>

        {userId ? (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button className="bg-navy-600 hover:bg-navy-700 text-white">
                <Plus className="h-4 w-4 mr-1" />
                Report Rejection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report a POA Rejection at {bankName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Rejection Reason</Label>
                  <Input
                    value={form.rejection_reason}
                    onChange={(e) =>
                      setForm({ ...form, rejection_reason: e.target.value })
                    }
                    placeholder="e.g., POA too old, missing notarization..."
                  />
                </div>
                <div>
                  <Label>POA Type</Label>
                  <Select
                    value={form.poa_type}
                    onValueChange={(v) => setForm({ ...form, poa_type: v || "durable" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="durable">Durable</SelectItem>
                      <SelectItem value="springing">Springing</SelectItem>
                      <SelectItem value="limited">Limited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Details (optional)</Label>
                  <Textarea
                    value={form.details}
                    onChange={(e) =>
                      setForm({ ...form, details: e.target.value })
                    }
                    placeholder="Describe what happened and any tips..."
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleSubmitReport}
                  disabled={submitting || !form.rejection_reason.trim()}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold"
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button variant="outline">
            <a href="/auth">Sign in to Report</a>
          </Button>
        )}
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-navy-400">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-navy-300" />
            <p>No rejection reports yet for {bankName}.</p>
            <p className="text-sm mt-1">
              Be the first to share your experience.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base text-navy-700">
                      {report.rejection_reason}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {report.poa_type && (
                        <Badge variant="secondary" className="text-xs">
                          {report.poa_type} POA
                        </Badge>
                      )}
                      <span className="text-xs text-navy-400">
                        {formatDistanceToNow(new Date(report.reported_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {report.details && (
                  <p className="text-sm text-navy-500 mb-3">
                    {report.details}
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(report.id, "up")}
                    className={
                      report.userVote === "up"
                        ? "text-green-600 bg-green-50"
                        : "text-navy-400"
                    }
                    disabled={!userId}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {report.upvotes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(report.id, "down")}
                    className={
                      report.userVote === "down"
                        ? "text-red-600 bg-red-50"
                        : "text-navy-400"
                    }
                    disabled={!userId}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    {report.downvotes}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
