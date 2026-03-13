"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { SubmissionChecklist } from "@/lib/types";

interface ChecklistItemProps {
  item: SubmissionChecklist & {
    requirement: {
      id: string;
      bank_id: string;
      category: "document" | "form" | "identification" | "other";
      title: string;
      description: string | null;
      is_required: boolean;
      sort_order: number;
    };
  };
  submissionId: string;
}

export function ChecklistItem({ item }: ChecklistItemProps) {
  const [isCompleted, setIsCompleted] = useState(item.is_completed);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  const handleToggle = async (checked: boolean) => {
    setUpdating(true);
    setIsCompleted(checked);

    try {
      const { error } = await supabase
        .from("submission_checklist")
        .update({
          is_completed: checked,
          completed_at: checked ? new Date().toISOString() : null,
        })
        .eq("id", item.id);

      if (error) {
        console.error("Error updating checklist:", error);
        // Revert on error
        setIsCompleted(!checked);
      }
    } catch (err) {
      console.error("Error updating checklist:", err);
      // Revert on error
      setIsCompleted(!checked);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        <Checkbox
          id={item.id}
          checked={isCompleted}
          onCheckedChange={handleToggle}
          disabled={updating}
          className="h-5 w-5"
        />
      </div>
      <div className="flex-1">
        <label
          htmlFor={item.id}
          className={`flex items-center gap-2 cursor-pointer ${
            isCompleted ? "text-navy-400 line-through" : "text-navy-700"
          }`}
        >
          <span className="font-medium">{item.requirement.title}</span>
          {item.requirement.is_required ? (
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
          {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        </label>
        {item.requirement.description && (
          <p
            className={`text-sm mt-1 ${
              isCompleted ? "text-navy-300" : "text-navy-400"
            }`}
          >
            {item.requirement.description}
          </p>
        )}
        {item.notes && (
          <p className="text-sm text-amber-600 mt-1 italic">
            Note: {item.notes}
          </p>
        )}
      </div>
    </div>
  );
}
