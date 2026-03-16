"use client";

import { useMemo } from "react";
import {
  platformTemplates,
  type PlatformTemplate,
  type TemplateField,
} from "@/lib/templates";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DetailFormProps {
  selectedPlatforms: string[];
  platformData: Record<string, Record<string, string>>;
  onDataChange: (
    platformId: string,
    fieldId: string,
    value: string
  ) => void;
}

export function DetailForm({
  selectedPlatforms,
  platformData,
  onDataChange,
}: DetailFormProps) {
  const templates = useMemo(() => {
    return selectedPlatforms
      .map((id) => platformTemplates.find((t) => t.id === id))
      .filter(Boolean) as PlatformTemplate[];
  }, [selectedPlatforms]);

  function renderField(platform: PlatformTemplate, field: TemplateField) {
    const value = platformData[platform.id]?.[field.id] ?? "";

    const fieldId = `${platform.id}-${field.id}`;

    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={fieldId}>
          {field.label}
          {field.required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        {field.type === "textarea" ? (
          <Textarea
            id={fieldId}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) =>
              onDataChange(platform.id, field.id, e.target.value)
            }
            rows={3}
          />
        ) : (
          <Input
            id={fieldId}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) =>
              onDataChange(platform.id, field.id, e.target.value)
            }
          />
        )}
      </div>
    );
  }

  function renderPlatformFields(platform: PlatformTemplate) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-hidden="true">
            {platform.icon}
          </span>
          <span className="font-medium">{platform.name}</span>
          <Badge variant="secondary" className="ml-auto">
            {platform.fields.filter((f) => f.required).length} required
          </Badge>
        </div>
        {platform.fields.map((field) => renderField(platform, field))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No platforms selected. Go back and select at least one platform.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Fill In Platform Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the credentials and recovery information for each platform.
          This data will be encrypted before it leaves your browser.
        </p>
      </div>

      {templates.length === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {templates[0].icon} {templates[0].name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates[0].fields.map((field) =>
              renderField(templates[0], field)
            )}
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={templates[0].id} className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-1">
            {templates.map((platform) => (
              <TabsTrigger key={platform.id} value={platform.id}>
                <span className="mr-1.5">{platform.icon}</span>
                {platform.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {templates.map((platform) => (
            <TabsContent key={platform.id} value={platform.id}>
              <Card>
                <CardContent className="pt-6">
                  {renderPlatformFields(platform)}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
