"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Editor } from "@tiptap/react";
import { Loader2 } from "lucide-react";

interface ScanField {
  type: "name" | "project" | "title" | "school";
  position: number;
  currentValue?: string;
  suggestion?: string;
}

type FieldType = "name" | "project" | "title" | "school";

interface UpdateDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scanData: {
    foundFields: {
      name?: string | null;
      project?: string | null;
      title?: string | null;
      school?: string | null;
    };
    placeholders: ScanField[];
  } | null;
  editor: Editor | null;
  onUpdate: (updates: Record<string, string>) => void;
}

export function UpdateDetailsModal({
  open,
  onOpenChange,
  scanData,
  editor,
  onUpdate,
}: UpdateDetailsModalProps) {
  const [updates, setUpdates] = useState<Record<string, string>>({
    name: "",
    project: "",
    title: "",
    school: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update state when scanData changes
  useEffect(() => {
    if (scanData?.foundFields) {
      setUpdates({
        name: scanData.foundFields.name || "",
        project: scanData.foundFields.project || "",
        title: scanData.foundFields.title || "",
        school: scanData.foundFields.school || "",
      });
    }
  }, [scanData]);

  const handleInputChange = (key: FieldType, value: string) => {
    setUpdates((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!editor || !scanData?.foundFields) {
      onUpdate(updates);
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const foundTypes = Object.entries(scanData.foundFields)
        .filter(([, value]) => value !== null)
        .map(([type]) => type as FieldType);

      // We chain all replacements into one command sequence if possible,
      // or just run them sequentially.
      const chain = editor.chain().focus();

      foundTypes.forEach((type) => {
        const oldValue = scanData.foundFields[type] || "";
        const newValue = updates[type];

        // Only replace if values are different and valid
        if (
          newValue !== oldValue &&
          newValue.trim() !== "" &&
          oldValue.trim() !== ""
        ) {
          chain.searchAndReplaceAll(oldValue, newValue);
        }
      });

      chain.setSearchTerm("").run();
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsSubmitting(false);
      onUpdate(updates);
      onOpenChange(false);
    }
  };

  const foundTypes = scanData
    ? Object.entries(scanData.foundFields)
        .filter(([, value]) => value !== null)
        .map(([type]) => type as FieldType)
    : [];

  if (!scanData || !open || foundTypes.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Update Document Details</DialogTitle>
          <DialogDescription>
            We detected existing values. Update them to personalize your
            document.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {foundTypes.map((type) => {
            const currentValue = scanData.foundFields[type] || "";
            return (
              <div key={type} className="space-y-2">
                <Label htmlFor={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Label>
                <Input
                  id={type}
                  value={updates[type] || ""}
                  onChange={(e) => handleInputChange(type, e.target.value)}
                  placeholder={`Enter ${type} (current: ${
                    currentValue || "none"
                  })`}
                />
                {currentValue && (
                  <p className="text-xs text-muted-foreground">
                    Current: {currentValue}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update & Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
