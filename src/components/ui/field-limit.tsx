import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldLimitProps = {
  htmlFor?: string;
  label: string;
  value: string;
  max: number;
  min?: number;
};

export function fieldLengthState(value: string, max: number, min = 0) {
  const length = value.length;
  const tooShort = length > 0 && length < min;
  const tooLong = length > max;
  return { length, tooShort, tooLong, invalid: tooShort || tooLong };
}

export function FieldLimit({ htmlFor, label, value, max, min = 0 }: FieldLimitProps) {
  const { length, invalid } = fieldLengthState(value, max, min);

  return (
    <div className="flex items-baseline justify-between gap-3">
      <Label htmlFor={htmlFor}>{label}</Label>
      <p
        className={cn(
          "font-mono text-[11px] tabular-nums",
          invalid ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {length}/{max}
        {min > 0 && length > 0 && length < min ? ` · min. ${min}` : null}
      </p>
    </div>
  );
}
