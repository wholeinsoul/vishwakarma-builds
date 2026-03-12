import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Bank, BankRequirement } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Clock,
  Phone,
  Globe,
  CheckCircle2,
  XCircle,
  FileText,
  ClipboardList,
  CreditCard,
  HelpCircle,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { RejectionReports } from "@/components/rejection-reports";

export const revalidate = 60;

const categoryIcons: Record<string, typeof FileText> = {
  document: FileText,
  form: ClipboardList,
  identification: CreditCard,
  other: HelpCircle,
};

const categoryLabels: Record<string, string> = {
  document: "Documents",
  form: "Forms",
  identification: "Identification",
  other: "Other Requirements",
};

export default async function BankDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: bank } = await supabase
    .from("banks")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!bank) notFound();

  const { data: requirements } = await supabase
    .from("bank_requirements")
    .select("*")
    .eq("bank_id", bank.id)
    .order("sort_order");

  const typedBank = bank as Bank;
  const typedRequirements = (requirements ?? []) as BankRequirement[];

  // Group requirements by category
  const grouped = typedRequirements.reduce(
    (acc, req) => {
      if (!acc[req.category]) acc[req.category] = [];
      acc[req.category].push(req);
      return acc;
    },
    {} as Record<string, BankRequirement[]>
  );

  const requiredCount = typedRequirements.filter((r) => r.is_required).length;
  const totalCount = typedRequirements.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/banks"
        className="inline-flex items-center text-sm text-navy-400 hover:text-navy-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Banks
      </Link>

      {/* Bank Header */}
      <div className="bg-gradient-to-r from-navy-600 to-navy-700 text-white rounded-xl p-6 md:p-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-white/10 p-3 rounded-lg">
            <Building2 className="h-8 w-8 text-amber-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {typedBank.name}
            </h1>
            <p className="text-navy-200 mb-4">{typedBank.notes}</p>

            <div className="flex flex-wrap gap-4 text-sm">
              {typedBank.processing_time_days && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span>~{typedBank.processing_time_days} days</span>
                </div>
              )}
              {typedBank.poa_phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-amber-400" />
                  <span>{typedBank.poa_phone}</span>
                </div>
              )}
              {typedBank.website && (
                <a
                  href={typedBank.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-amber-300"
                >
                  <Globe className="h-4 w-4 text-amber-400" />
                  <span>Website</span>
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {typedBank.accepts_durable_poa && (
                <Badge className="bg-green-500/20 text-green-200 border-green-400/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Durable POA
                </Badge>
              )}
              {typedBank.accepts_springing_poa && (
                <Badge className="bg-green-500/20 text-green-200 border-green-400/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Springing POA
                </Badge>
              )}
              {typedBank.requires_notarization && (
                <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/30">
                  Notarization Required
                </Badge>
              )}
              {typedBank.requires_medallion && (
                <Badge className="bg-red-500/20 text-red-200 border-red-400/30">
                  Medallion Required
                </Badge>
              )}
              {typedBank.allows_remote_submission ? (
                <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                  Remote Submission OK
                </Badge>
              ) : (
                <Badge className="bg-gray-500/20 text-gray-200 border-gray-400/30">
                  <XCircle className="h-3 w-3 mr-1" />
                  In-Branch Only
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requirements summary */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-navy-700">
            Document Checklist
          </h2>
          <p className="text-sm text-navy-400">
            {requiredCount} required, {totalCount - requiredCount} optional
            items
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold">
            Start Submission
          </Button>
        </Link>
      </div>

      {/* Requirements by category */}
      <div className="space-y-6 mb-12">
        {Object.entries(grouped).map(([category, reqs]) => {
          const Icon = categoryIcons[category] || HelpCircle;
          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-navy-700">
                  <Icon className="h-5 w-5 text-amber-500" />
                  {categoryLabels[category] || category}
                  <Badge variant="secondary" className="ml-2">
                    {reqs.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reqs.map((req, i) => (
                    <div key={req.id}>
                      {i > 0 && <Separator className="mb-3" />}
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {req.is_required ? (
                            <div className="w-5 h-5 rounded border-2 border-navy-300 flex items-center justify-center">
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded border-2 border-gray-200" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-navy-700">
                              {req.title}
                            </span>
                            {req.is_required ? (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-red-50 text-red-600 border-red-200"
                              >
                                Required
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-gray-50 text-gray-500"
                              >
                                Optional
                              </Badge>
                            )}
                          </div>
                          {req.description && (
                            <p className="text-sm text-navy-400 mt-1">
                              {req.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Community Rejection Reports */}
      <Separator className="mb-8" />
      <RejectionReports bankId={typedBank.id} bankName={typedBank.name} />
    </div>
  );
}
