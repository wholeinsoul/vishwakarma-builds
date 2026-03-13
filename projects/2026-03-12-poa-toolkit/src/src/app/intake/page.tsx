"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { Bank, IntakeForm } from "@/lib/types";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

const STEPS = [
  "Banks",
  "Principal",
  "Agent",
  "POA Type",
  "Documents",
  "Review",
];

const POA_TYPES = [
  {
    value: "durable",
    label: "Durable POA",
    description:
      "Takes effect immediately and remains valid even if the principal becomes incapacitated. Most commonly used for banking and financial matters.",
  },
  {
    value: "springing",
    label: "Springing POA",
    description:
      "Only takes effect when a specific event occurs (usually incapacitation). Requires proof of incapacity. Not accepted by all banks.",
  },
  {
    value: "limited",
    label: "Limited POA",
    description:
      "Grants authority for specific transactions or time periods only. Less common for ongoing bank account management.",
  },
];

export default function IntakePage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading] = useState(false);
  const [error, setError] = useState("");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [formData, setFormData] = useState<Partial<IntakeForm>>({
    selected_bank_ids: [],
    poa_type: "durable",
    has_existing_poa: false,
  });
  const [otherBank, setOtherBank] = useState("");

  useEffect(() => {
    loadBanks();
    loadDraftForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBanks = async () => {
    const { data } = await supabase
      .from("banks")
      .select("*")
      .order("name");
    if (data) setBanks(data);
  };

  const loadDraftForm = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { data } = await supabase
      .from("intake_forms")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setFormData(data);
    }
  };

  const saveProgress = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      ...formData,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (formData.id) {
      await supabase
        .from("intake_forms")
        .update(payload)
        .eq("id", formData.id);
    } else {
      const { data } = await supabase
        .from("intake_forms")
        .insert(payload)
        .select()
        .single();
      if (data) setFormData(data);
    }
  };

  const handleNext = async () => {
    setError("");

    // Validation
    if (currentStep === 0 && formData.selected_bank_ids?.length === 0) {
      setError("Please select at least one bank");
      return;
    }
    if (currentStep === 1) {
      if (!formData.principal_name || !formData.principal_state) {
        setError("Please fill in all required fields");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.agent_name || !formData.agent_email) {
        setError("Please fill in all required fields");
        return;
      }
    }

    await saveProgress();

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - go to payment
      router.push(`/intake/payment?form=${formData.id}`);
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const toggleBank = (bankId: string) => {
    const current = formData.selected_bank_ids || [];
    const updated = current.includes(bankId)
      ? current.filter((id) => id !== bankId)
      : [...current, bankId];
    setFormData({ ...formData, selected_bank_ids: updated });
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-700 mb-4">
          POA Autopilot Intake
        </h1>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-navy-400">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
          </p>
          <p className="text-sm text-navy-400">{Math.round(progress)}%</p>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep]}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-navy-400 mb-4">
                Which banks does your principal use? Select all that apply.
              </p>
              <div className="space-y-2">
                {banks.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex items-center space-x-2 p-3 border rounded hover:bg-navy-50"
                  >
                    <Checkbox
                      id={bank.id}
                      checked={formData.selected_bank_ids?.includes(bank.id)}
                      onCheckedChange={() => toggleBank(bank.id)}
                    />
                    <label
                      htmlFor={bank.id}
                      className="flex-1 cursor-pointer font-medium"
                    >
                      {bank.name}
                    </label>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <Label htmlFor="other">
                  Other bank (we&apos;ll research requirements for you)
                </Label>
                <Input
                  id="other"
                  value={otherBank}
                  onChange={(e) => setOtherBank(e.target.value)}
                  placeholder="Enter bank name"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="principal_name">
                  Principal&apos;s Full Legal Name *
                </Label>
                <Input
                  id="principal_name"
                  value={formData.principal_name || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      principal_name: e.target.value,
                    })
                  }
                  placeholder="John Smith"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="principal_state">State of Residence *</Label>
                <Input
                  id="principal_state"
                  value={formData.principal_state || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      principal_state: e.target.value,
                    })
                  }
                  placeholder="CA"
                  maxLength={2}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="principal_dob">Date of Birth</Label>
                <Input
                  id="principal_dob"
                  type="date"
                  value={formData.principal_dob || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, principal_dob: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="agent_name">Your Full Legal Name *</Label>
                <Input
                  id="agent_name"
                  value={formData.agent_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, agent_name: e.target.value })
                  }
                  placeholder="Jane Smith"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="agent_relationship">Relationship to Principal</Label>
                <Input
                  id="agent_relationship"
                  value={formData.agent_relationship || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      agent_relationship: e.target.value,
                    })
                  }
                  placeholder="Daughter"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="agent_email">Your Email *</Label>
                <Input
                  id="agent_email"
                  type="email"
                  value={formData.agent_email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, agent_email: e.target.value })
                  }
                  placeholder="jane@example.com"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="agent_phone">Your Phone</Label>
                <Input
                  id="agent_phone"
                  type="tel"
                  value={formData.agent_phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, agent_phone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-navy-400 mb-4">
                What type of Power of Attorney do you have or need?
              </p>
              {POA_TYPES.map((type) => (
                <div
                  key={type.value}
                  className={`p-4 border rounded cursor-pointer transition ${
                    formData.poa_type === type.value
                      ? "border-amber-500 bg-amber-50"
                      : "border-navy-200 hover:bg-navy-50"
                  }`}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      poa_type: type.value as "durable" | "springing" | "limited",
                    })
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-navy-700">
                      {type.label}
                    </h3>
                    {formData.poa_type === type.value && (
                      <CheckCircle2 className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                  <p className="text-sm text-navy-400">{type.description}</p>
                </div>
              ))}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_existing"
                  checked={formData.has_existing_poa || false}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      has_existing_poa: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="has_existing">
                  I already have a signed POA document
                </Label>
              </div>
              {formData.has_existing_poa && (
                <div className="mt-4 p-4 bg-navy-50 rounded">
                  <Label htmlFor="poa_url">POA Document URL (optional)</Label>
                  <Input
                    id="poa_url"
                    value={formData.existing_poa_url || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        existing_poa_url: e.target.value,
                      })
                    }
                    placeholder="https://drive.google.com/file..."
                    className="mt-2"
                  />
                  <p className="text-xs text-navy-400 mt-2">
                    Upload to Google Drive, Dropbox, or similar and paste the
                    shareable link here. We&apos;ll review it as part of your
                    concierge service.
                  </p>
                </div>
              )}
              {!formData.has_existing_poa && (
                <Alert>
                  <AlertDescription>
                    No problem! Our concierge service will help you understand
                    what type of POA you need and guide you through obtaining
                    one that will be accepted by your selected banks.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-navy-700 text-lg">
                Review Your Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-navy-400">Selected Banks</p>
                  <p className="font-medium">
                    {banks
                      .filter((b) => formData.selected_bank_ids?.includes(b.id))
                      .map((b) => b.name)
                      .join(", ")}
                    {otherBank && `, ${otherBank}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-navy-400">Principal</p>
                  <p className="font-medium">
                    {formData.principal_name} ({formData.principal_state})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-navy-400">Agent</p>
                  <p className="font-medium">
                    {formData.agent_name} - {formData.agent_email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-navy-400">POA Type</p>
                  <p className="font-medium">
                    {
                      POA_TYPES.find((t) => t.value === formData.poa_type)
                        ?.label
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-navy-400">Existing POA</p>
                  <p className="font-medium">
                    {formData.has_existing_poa ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              <Alert className="bg-amber-50 border-amber-200">
                <AlertDescription>
                  <strong>Next:</strong> You&apos;ll complete payment ($399) and our
                  concierge team will begin researching and preparing your
                  submissions within 24 hours.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={loading}>
          {currentStep === STEPS.length - 1 ? (
            "Proceed to Payment"
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
