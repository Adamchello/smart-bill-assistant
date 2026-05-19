"use client";

export function BoldNumbers({ text }: { text: string }) {
  const parts = text.split(/(\$[\d,]+(?:\.\d+)?(?:\/mo)?|\d+%)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\$[\d,]+(?:\.\d+)?(?:\/mo)?$|^\d+%$/.test(part) ? (
          <span key={i} className="font-semibold text-foreground">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
