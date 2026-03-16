"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  UserPlus,
  Trash2,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export interface Beneficiary {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  notification_status?: string;
}

interface BeneficiaryListProps {
  planId: string;
  beneficiaries: Beneficiary[];
  onBeneficiaryAdded?: (beneficiary: Beneficiary) => void;
  onBeneficiaryRemoved?: (beneficiaryId: string) => void;
}

export function BeneficiaryList({
  planId,
  beneficiaries,
  onBeneficiaryAdded,
  onBeneficiaryRemoved,
}: BeneficiaryListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [formError, setFormError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and email are required.");
      return;
    }

    setAddLoading(true);

    try {
      const res = await fetch("/api/beneficiaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add beneficiary");
      }

      const data = await res.json();
      onBeneficiaryAdded?.(data.beneficiary);
      setFormData({ name: "", email: "", phone: "" });
      setDialogOpen(false);
      toast({
        title: "Beneficiary added",
        description: `${formData.name} has been added to this plan.`,
      });
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to add beneficiary"
      );
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemove = async (beneficiary: Beneficiary) => {
    setRemovingId(beneficiary.id);

    try {
      const res = await fetch(`/api/beneficiaries/${beneficiary.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove beneficiary");
      }

      onBeneficiaryRemoved?.(beneficiary.id);
      toast({
        title: "Beneficiary removed",
        description: `${beneficiary.name} has been removed from this plan.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to remove beneficiary",
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const notificationStatusBadge = (status?: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Notified</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Not sent</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-muted-foreground">
          Beneficiaries ({beneficiaries.length})
        </h4>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Beneficiary
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Beneficiary</DialogTitle>
              <DialogDescription>
                Add a person who will receive access to your recovery plan if the
                dead man&apos;s switch is triggered.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              {formError && (
                <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="ben-name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ben-name"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ben-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ben-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ben-phone">
                  Phone <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ben-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addLoading}>
                  {addLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Beneficiary"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {beneficiaries.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          <User className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No beneficiaries added yet.</p>
          <p className="text-xs mt-1">
            Add someone who should receive your recovery plan.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {beneficiaries.map((ben, index) => (
            <div key={ben.id}>
              {index > 0 && <Separator className="my-2" />}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {ben.name}
                    </span>
                    {notificationStatusBadge(ben.notification_status)}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">
                      {ben.email}
                    </span>
                    {ben.phone && (
                      <span className="text-xs text-muted-foreground">
                        {ben.phone}
                      </span>
                    )}
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      disabled={removingId === ben.id}
                    >
                      {removingId === ben.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Beneficiary</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove{" "}
                        <strong>{ben.name}</strong> from this recovery plan?
                        They will no longer receive access if the switch is
                        triggered.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemove(ben)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
