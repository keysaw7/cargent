import { cn } from "@/lib/utils";

type StarRowProps = {
  level: number;
  className?: string;
  filledClass?: string;
  emptyClass?: string;
};

export function LevelStar({
  filled,
  filledClass,
  emptyClass,
  className,
}: {
  filled: boolean;
  filledClass: string;
  emptyClass: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-3.5", filled ? filledClass : emptyClass, className)}
    >
      <path
        fill="currentColor"
        d="M12 1.6 13.7 8h6.7l-5.4 3.9 2 6.4L12 14.8 6.9 18.3l2-6.4L3.6 8h6.7L12 1.6Z"
      />
    </svg>
  );
}

export function StarRow({
  level,
  className,
  filledClass = "text-gold",
  emptyClass = "text-gold/25",
}: StarRowProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`Niveau ${level}`}>
      {Array.from({ length: 12 }, (_, index) => (
        <LevelStar
          key={index}
          filled={index < level}
          filledClass={filledClass}
          emptyClass={emptyClass}
        />
      ))}
    </div>
  );
}
