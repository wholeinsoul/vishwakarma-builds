"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { Bank } from "@/lib/types";

export default function NewSubmissionPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [formData, setFormData] = useState({
    bank_id: "",
    principal_name: "",
    agent_name: "",
    poa_type: "" as "durable" | "springing" | "limited" | "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check authentication
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/auth");
      } else {
        setChecking(false);
      }
    });

    // Fetch banks
    supabase
      .from("banks")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (data) setBanks(data as Bank[]);
      });
  }, [supabase, router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bank_id) newErrors.bank_id = "Please select a bank";
    if (!formData.principal_name.trim())
      newErrors.principal_name = "Principal name is required";
    if (!formData.agent_name.trim())
      newErrors.agent_name = "Agent name is required";
    if (!formData.poa_type) newErrors.poa_type = "Please select a POA type";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      // Create submission
      const { data: submission, error: submissionError } = await supabase
        .from("submissions")
        .insert({
          user_id: user.id,
          bank_id: formData.bank_id,
          principal_name: formData.principal_name.trim(),
          agent_name: formData.agent_name.trim(),
          poa_type: formData.poa_type,
          status: "preparing",
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Fetch bank requirements and create checklist items
      const { data: requirements } = await supabase
        .from("bank_requirements")
        .select("id")
        .eq("bank_id", formData.bank_id);

      if (requirements && requirements.length > 0) {
        const checklistItems = requirements.map((req) => ({
          submission_id: submission.id,
          requirement_id: req.id,
          is_completed: false,
        }));

        await supabase.from("submission_checklist").insert(checklistItems);
      }

      // Redirect to the submission detail page
      router.push(`/dashboard/${submission.id}`);
    } catch (error) {
      console.error("Error creating submission:", error);
      setErrors({ submit: "Failed to create submission. Please try again." });
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto mb-4"></div>
          <p className="text-navy-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-navy-400 hover:text-navy-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-amber-100 p-2 rounded-lg">
            <FileText className="h-6 w-6 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-navy-700">New Submission</h1>
        </div>
        <p className="text-navy-400">
          Create a new Power of Attorney submission
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-navy-700">Submission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bank Selection */}
            <div className="space-y-2">
              <Label htmlFor="bank_id" className="text-navy-700">
                Bank *
              </Label>
              <Select
                value={formData.bank_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, bank_id: value || "" })
                }
              >
                <SelectTrigger
                  id="bank_id"
                  className={errors.bank_id ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bank_id && (
                <p className="text-sm text-red-600">{errors.bank_id}</p>
              )}
            </div>

            {/* Principal Name */}
            <div className="space-y-2">
              <Label htmlFor="principal_name" className="text-navy-700">
                Principal Name *
              </Label>
              <Input
                id="principal_name"
                type="text"
                placeholder="Person granting the power"
                value={formData.principal_name}
                onChange={(e) =>
                  setFormData({ ...formData, principal_name: e.target.value })
                }
                className={errors.principal_name ? "border-red-500" : ""}
              />
              {errors.principal_name && (
                <p className="text-sm text-red-600">{errors.principal_name}</p>
              )}
            </div>

            {/* Agent Name */}
            <div className="space-y-2">
              <Label htmlFor="agent_name" className="text-navy-700">
                Agent Name *
              </Label>
              <Input
                id="agent_name"
                type="text"
                placeholder="Person receiving the power"
                value={formData.agent_name}
                onChange={(e) =>
                  setFormData({ ...formData, agent_name: e.target.value })
                }
                className={errors.agent_name ? "border-red-500" : ""}
              />
              {errors.agent_name && (
                <p className="text-sm text-red-600">{errors.agent_name}</p>
              )}
            </div>

            {/* POA Type */}
            <div className="space-y-2">
              <Label htmlFor="poa_type" className="text-navy-700">
                Power of Attorney Type *
              </Label>
              <Select
                value={formData.poa_type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    poa_type: value as "durable" | "springing" | "limited",
                  })
                }
              >
                <SelectTrigger
                  id="poa_type"
                  className={errors.poa_type ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select POA type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="durable">
                    Durable POA (Effective immediately and continues if
                    incapacitated)
                  </SelectItem>
                  <SelectItem value="springing">
                    Springing POA (Takes effect only upon incapacitation)
                  </SelectItem>
                  <SelectItem value="limited">
                    Limited POA (Specific purpose or time period)
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.poa_type && (
                <p className="text-sm text-red-600">{errors.poa_type}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Submission"
                )}
              </Button>
              <Link href="/dashboard">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="border-navy-300 text-navy-600 hover:bg-navy-50"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
