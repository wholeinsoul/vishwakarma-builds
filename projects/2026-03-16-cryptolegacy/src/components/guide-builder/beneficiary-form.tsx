"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { beneficiarySchema, type Beneficiary } from "@/lib/validations";

interface BeneficiaryFormProps {
  beneficiaries: Beneficiary[];
  onBeneficiariesChange: (beneficiaries: Beneficiary[]) => void;
}

export function BeneficiaryForm({
  beneficiaries,
  onBeneficiariesChange,
}: BeneficiaryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function addBeneficiary() {
    const result = beneficiarySchema.safeParse({ name, email, phone: phone || undefined });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    onBeneficiariesChange([...beneficiaries, result.data]);
    setName("");
    setEmail("");
    setPhone("");
    setErrors({});
  }

  function removeBeneficiary(index: number) {
    onBeneficiariesChange(beneficiaries.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addBeneficiary();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Add Beneficiaries</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add the people who should receive access to your recovery plan.
          At least one beneficiary is required.
        </p>
      </div>

      {/* Added beneficiaries list */}
      {beneficiaries.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Beneficiaries ({beneficiaries.length})
          </Label>
          {beneficiaries.map((b, index) => (
            <Card key={index}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.email}</p>
                  </div>
                  {b.phone && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {b.phone}
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBeneficiary(index)}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add beneficiary form */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm font-medium">Add a beneficiary</p>

          <div className="space-y-2">
            <Label htmlFor="beneficiary-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="beneficiary-name"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficiary-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="beneficiary-email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficiary-phone">Phone (optional)</Label>
            <Input
              id="beneficiary-phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          <Button type="button" variant="secondary" onClick={addBeneficiary}>
            + Add Beneficiary
          </Button>
        </CardContent>
      </Card>

      {beneficiaries.length === 0 && (
        <p className="text-sm text-destructive">
          At least one beneficiary is required to continue.
        </p>
      )}
    </div>
  );
}
