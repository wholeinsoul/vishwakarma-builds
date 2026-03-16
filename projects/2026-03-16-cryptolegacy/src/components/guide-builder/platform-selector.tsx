"use client";

import { platformTemplates, type PlatformTemplate } from "@/lib/templates";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onSelectionChange: (platforms: string[]) => void;
}

export function PlatformSelector({
  selectedPlatforms,
  onSelectionChange,
}: PlatformSelectorProps) {
  function togglePlatform(platformId: string) {
    if (selectedPlatforms.includes(platformId)) {
      onSelectionChange(selectedPlatforms.filter((id) => id !== platformId));
    } else {
      onSelectionChange([...selectedPlatforms, platformId]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Select Your Platforms</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the crypto platforms and wallets you want to include in your
          recovery plan. You can select multiple.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platformTemplates.map((platform: PlatformTemplate) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          return (
            <Card
              key={platform.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected &&
                  "border-primary ring-2 ring-primary ring-offset-2"
              )}
              onClick={() => togglePlatform(platform.id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => togglePlatform(platform.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${platform.name}`}
                />
                <span className="text-3xl" role="img" aria-hidden="true">
                  {platform.icon}
                </span>
                <div className="flex-1">
                  <Label className="cursor-pointer text-base font-medium">
                    {platform.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {platform.fields.length} fields
                  </p>
                </div>
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-primary"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPlatforms.length === 0 && (
        <p className="text-sm text-destructive">
          Please select at least one platform to continue.
        </p>
      )}

      {selectedPlatforms.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedPlatforms.length} platform
          {selectedPlatforms.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}
