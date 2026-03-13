"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { IntakeForm, Bank } from "@/lib/types";
import { CreditCard, Lock, CheckCircle2, AlertCircle } from "lucide-react";

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("form");
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [intakeForm, setIntakeForm] = useState<IntakeForm | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);

  // Test card fields (non-functional)
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    loadIntakeForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const loadIntakeForm = async () => {
    if (!formId) {
      setError("No intake form found");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { data: form } = await supabase
      .from("intake_forms")
      .select("*")
      .eq("id", formId)
      .eq("user_id", user.id)
      .single();

    if (!form) {
      setError("Intake form not found");
      return;
    }

    setIntakeForm(form);
    setName(form.agent_name || "");

    // Load bank names
    const { data: banksData } = await supabase
      .from("banks")
      .select("*")
      .in("id", form.selected_bank_ids);
    if (banksData) setBanks(banksData);
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !intakeForm) return;

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          intake_form_id: intakeForm.id,
          amount_cents: 39900,
          currency: "usd",
          status: "completed",
          stripe_session_id: `test_${Date.now()}`,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update intake form status
      await supabase
        .from("intake_forms")
        .update({ status: "paid" })
        .eq("id", intakeForm.id);

      // Create submissions for each selected bank
      const submissions = intakeForm.selected_bank_ids.map((bankId) => ({
        user_id: user.id,
        bank_id: bankId,
        principal_name: intakeForm.principal_name!,
        agent_name: intakeForm.agent_name!,
        poa_type: intakeForm.poa_type,
        status: "preparing",
        notes: `Concierge service - Payment ID: ${payment.id}`,
      }));

      await supabase.from("submissions").insert(submissions);

      // Redirect to dashboard
      router.push("/dashboard?success=payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!intakeForm) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Loading payment details...</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Alert className="mb-6 bg-amber-50 border-amber-300">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>TEST MODE</strong> — No real charges will be made. This is a
          demo payment page.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-500" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-navy-400 mb-2">Service</p>
              <p className="font-semibold text-lg">POA Autopilot Concierge</p>
            </div>
            <div>
              <p className="text-sm text-navy-400 mb-2">
                Banks ({banks.length})
              </p>
              <ul className="text-sm space-y-1">
                {banks.map((bank) => (
                  <li key={bank.id}>• {bank.name}</li>
                ))}
              </ul>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-navy-400 mb-1">Principal</p>
              <p className="font-medium">{intakeForm.principal_name}</p>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-navy-400 mb-1">POA Type</p>
              <p className="font-medium capitalize">{intakeForm.poa_type}</p>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-navy-700">$399</span>
              </div>
              <p className="text-xs text-navy-400 mt-1">One-time payment</p>
            </div>
            <div className="bg-navy-50 p-3 rounded text-sm">
              <p className="font-semibold text-navy-700 mb-1">
                What&apos;s Included:
              </p>
              <ul className="text-navy-400 space-y-1">
                <li>✓ Bank-specific requirement research</li>
                <li>✓ Document preparation guidance</li>
                <li>✓ Submission tracking & monitoring</li>
                <li>✓ 48-hour turnaround guarantee</li>
                <li>✓ Unlimited revisions if rejected</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-navy-400" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="name">Cardholder Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="card">Card Number</Label>
              <div className="relative mt-2">
                <Input
                  id="card"
                  value={cardNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setCardNumber(
                      val
                        .match(/.{1,4}/g)
                        ?.join(" ")
                        .substring(0, 19) || val
                    );
                  }}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                />
                <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-navy-400" />
              </div>
              <p className="text-xs text-navy-400 mt-1">
                Test card: 4242 4242 4242 4242
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  value={expiry}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length >= 2) {
                      setExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
                    } else {
                      setExpiry(val);
                    }
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  value={cvc}
                  onChange={(e) =>
                    setCvc(e.target.value.replace(/\D/g, "").substring(0, 4))
                  }
                  placeholder="123"
                  maxLength={4}
                  className="mt-2"
                />
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={loading || !name || !cardNumber}
              className="w-full bg-amber-500 hover:bg-amber-600 text-navy-900 font-bold text-lg py-6"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Pay $399
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-navy-400 pt-2">
              <Lock className="h-3 w-3" />
              <span>Secure payment powered by Stripe (Test Mode)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 max-w-2xl text-center">Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
