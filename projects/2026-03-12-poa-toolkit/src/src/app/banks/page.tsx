import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Bank } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  ExternalLink,
} from "lucide-react";

export const revalidate = 60;

export default async function BanksPage() {
  const supabase = await createServerSupabaseClient();
  const { data: banks } = await supabase
    .from("banks")
    .select("*")
    .order("name");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-700 mb-2">
          Bank POA Requirements
        </h1>
        <p className="text-navy-400">
          Select a bank to view detailed Power of Attorney requirements and
          generate a document checklist.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(banks as Bank[])?.map((bank) => (
          <Link key={bank.id} href={`/banks/${bank.slug}`}>
            <Card className="h-full hover:shadow-lg transition-all hover:border-amber-300 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-navy-100 p-2 rounded-lg">
                      <Building2 className="h-6 w-6 text-navy-600" />
                    </div>
                    <CardTitle className="text-navy-700">{bank.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bank.processing_time_days && (
                    <div className="flex items-center gap-2 text-sm text-navy-500">
                      <Clock className="h-4 w-4" />
                      <span>~{bank.processing_time_days} days processing</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {bank.accepts_durable_poa && (
                      <Badge
                        variant="secondary"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Durable
                      </Badge>
                    )}
                    {bank.accepts_springing_poa && (
                      <Badge
                        variant="secondary"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Springing
                      </Badge>
                    )}
                    {bank.requires_medallion && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-50 text-amber-700 border-amber-200"
                      >
                        Medallion Req.
                      </Badge>
                    )}
                    {bank.allows_remote_submission && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        Remote OK
                      </Badge>
                    )}
                    {!bank.allows_remote_submission && (
                      <Badge
                        variant="secondary"
                        className="bg-gray-50 text-gray-600 border-gray-200"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        In-Branch Only
                      </Badge>
                    )}
                  </div>

                  {bank.poa_phone && (
                    <div className="flex items-center gap-2 text-sm text-navy-400">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{bank.poa_phone}</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center text-sm text-amber-600 font-medium">
                    View Requirements
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
