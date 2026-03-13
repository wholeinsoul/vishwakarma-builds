import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Submission } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Building2,
  Calendar,
  User,
  FileText,
  ClipboardList,
} from "lucide-react";

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

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch user's submissions with bank data
  const { data: submissions } = await supabase
    .from("submissions")
    .select(
      `
      *,
      bank:banks(name, slug)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const typedSubmissions = (submissions ?? []) as (Submission & {
    bank: { name: string; slug: string };
  })[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-700 mb-2">
            My Submissions
          </h1>
          <p className="text-navy-400">
            Track and manage your Power of Attorney submissions
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold">
            <Plus className="h-4 w-4 mr-2" />
            New Submission
          </Button>
        </Link>
      </div>

      {typedSubmissions.length === 0 ? (
        <Card className="border-2 border-dashed border-navy-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-navy-50 p-4 rounded-full mb-4">
              <ClipboardList className="h-12 w-12 text-navy-300" />
            </div>
            <h3 className="text-xl font-semibold text-navy-700 mb-2">
              No submissions yet
            </h3>
            <p className="text-navy-400 text-center max-w-md mb-6">
              Start your first Power of Attorney submission by selecting a bank
              and filling out the required information.
            </p>
            <Link href="/dashboard/new">
              <Button className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Submission
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {typedSubmissions.map((submission) => (
            <Link key={submission.id} href={`/dashboard/${submission.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="bg-navy-50 p-2 rounded-lg">
                      <Building2 className="h-5 w-5 text-navy-600" />
                    </div>
                    <Badge
                      className={statusColors[submission.status] || ""}
                      variant="outline"
                    >
                      {statusLabels[submission.status] || submission.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-navy-700">
                    {submission.bank.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-navy-600">
                      <User className="h-4 w-4 text-navy-400" />
                      <span className="font-medium">Principal:</span>
                      <span>{submission.principal_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-navy-600">
                      <User className="h-4 w-4 text-navy-400" />
                      <span className="font-medium">Agent:</span>
                      <span>{submission.agent_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-navy-600">
                      <FileText className="h-4 w-4 text-navy-400" />
                      <span className="font-medium">Type:</span>
                      <span>{poaTypeLabels[submission.poa_type]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-navy-400 text-xs pt-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        Created{" "}
                        {new Date(submission.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
