import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Submission, SubmissionChecklist } from "@/lib/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Building2,
  User,
  FileText,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { ChecklistItem } from "@/components/checklist-item";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  preparing: "bg-blue-100 text-blue-700 border-blue-300",
  submitted: "bg-yellow-100 text-yellow-700 border-yellow-300",
  under_review: "bg-purple-100 text-purple-700 border-purple-300",
  approved: "bg-green-100 text-green-700 border-green-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
};

const statusLabels: Record<string, string> = {
  preparing: "Preparing",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};

const poaTypeLabels: Record<string, string> = {
  durable: "Durable POA",
  springing: "Springing POA",
  limited: "Limited POA",
};

const categoryIcons: Record<string, typeof FileText> = {
  document: FileText,
  form: FileText,
  identification: FileText,
  other: FileText,
};

const categoryLabels: Record<string, string> = {
  document: "Documents",
  form: "Forms",
  identification: "Identification",
  other: "Other Requirements",
};

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch submission with bank data
  const { data: submission } = await supabase
    .from("submissions")
    .select(
      `
      *,
      bank:banks(*)
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!submission) notFound();

  const typedSubmission = submission as Submission & {
    bank: {
      id: string;
      name: string;
      slug: string;
      logo_url: string | null;
      website: string | null;
      poa_phone: string | null;
      poa_email: string | null;
      processing_time_days: number | null;
      accepts_springing_poa: boolean;
      accepts_durable_poa: boolean;
      requires_notarization: boolean;
      requires_medallion: boolean;
      allows_remote_submission: boolean;
      notes: string | null;
    };
  };

  // Fetch checklist with requirements
  const { data: checklist } = await supabase
    .from("submission_checklist")
    .select(
      `
      *,
      requirement:bank_requirements(*)
    `
    )
    .eq("submission_id", id)
    .order("requirement(sort_order)");

  const typedChecklist = (checklist ?? []) as (SubmissionChecklist & {
    requirement: {
      id: string;
      bank_id: string;
      category: "document" | "form" | "identification" | "other";
      title: string;
      description: string | null;
      is_required: boolean;
      sort_order: number;
    };
  })[];

  // Group checklist by category
  const grouped = typedChecklist.reduce(
    (acc, item) => {
      const category = item.requirement.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    },
    {} as Record<
      string,
      (SubmissionChecklist & {
        requirement: {
          id: string;
          bank_id: string;
          category: "document" | "form" | "identification" | "other";
          title: string;
          description: string | null;
          is_required: boolean;
          sort_order: number;
        };
      })[]
    >
  );

  const completedCount = typedChecklist.filter((item) => item.is_completed).length;
  const totalCount = typedChecklist.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-navy-400 hover:text-navy-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      {/* Submission Header */}
      <div className="bg-gradient-to-r from-navy-600 to-navy-700 text-white rounded-xl p-6 md:p-8 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <Building2 className="h-8 w-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {typedSubmission.bank.name}
              </h1>
              <Badge
                className={`${statusColors[typedSubmission.status]} text-sm`}
                variant="outline"
              >
                {statusLabels[typedSubmission.status]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-amber-400" />
            <div>
              <span className="text-navy-200">Principal:</span>
              <span className="ml-2 font-medium">
                {typedSubmission.principal_name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-amber-400" />
            <div>
              <span className="text-navy-200">Agent:</span>
              <span className="ml-2 font-medium">
                {typedSubmission.agent_name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-400" />
            <div>
              <span className="text-navy-200">Type:</span>
              <span className="ml-2 font-medium">
                {poaTypeLabels[typedSubmission.poa_type]}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs text-navy-200">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            Created {new Date(typedSubmission.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Progress Summary */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-navy-700">
              Checklist Progress
            </CardTitle>
            <span className="text-sm font-medium text-navy-600">
              {completedCount} of {totalCount} items completed
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-navy-400 mt-2">
            {progress === 100
              ? "All requirements completed! You're ready to submit."
              : `${totalCount - completedCount} items remaining`}
          </p>
        </CardContent>
      </Card>

      {/* Checklist by Category */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => {
          const Icon =
            categoryIcons[category as keyof typeof categoryIcons] || FileText;
          const categoryCompleted = items.filter((i) => i.is_completed).length;
          const categoryTotal = items.length;

          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-navy-700">
                    <Icon className="h-5 w-5 text-amber-500" />
                    {categoryLabels[category] || category}
                    <Badge variant="secondary" className="ml-2">
                      {categoryCompleted}/{categoryTotal}
                    </Badge>
                  </CardTitle>
                  {categoryCompleted === categoryTotal && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={item.id}>
                      {i > 0 && <Separator className="mb-3" />}
                      <ChecklistItem
                        item={item}
                        submissionId={typedSubmission.id}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bank Contact Info */}
      {(typedSubmission.bank.poa_phone ||
        typedSubmission.bank.poa_email ||
        typedSubmission.bank.website) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-navy-700">Bank Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {typedSubmission.bank.poa_phone && (
              <div>
                <span className="font-medium text-navy-600">Phone:</span>{" "}
                <a
                  href={`tel:${typedSubmission.bank.poa_phone}`}
                  className="text-amber-600 hover:underline"
                >
                  {typedSubmission.bank.poa_phone}
                </a>
              </div>
            )}
            {typedSubmission.bank.poa_email && (
              <div>
                <span className="font-medium text-navy-600">Email:</span>{" "}
                <a
                  href={`mailto:${typedSubmission.bank.poa_email}`}
                  className="text-amber-600 hover:underline"
                >
                  {typedSubmission.bank.poa_email}
                </a>
              </div>
            )}
            {typedSubmission.bank.website && (
              <div>
                <span className="font-medium text-navy-600">Website:</span>{" "}
                <a
                  href={typedSubmission.bank.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:underline"
                >
                  {typedSubmission.bank.website}
                </a>
              </div>
            )}
            {typedSubmission.bank.processing_time_days && (
              <div>
                <span className="font-medium text-navy-600">
                  Processing Time:
                </span>{" "}
                ~{typedSubmission.bank.processing_time_days} days
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
