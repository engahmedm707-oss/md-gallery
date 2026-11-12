"use client";

import { useEffect, useState, useTransition } from "react";

export function ConfirmDeleteButton({
  action,
  label = "Delete",
  className = "btn btn-danger btn-sm",
  confirmMessage = "Are you sure? This action is permanent and cannot be undone.",
}: {
  action: () => Promise<void>;
  label?: string;
  className?: string;
  confirmMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  function confirm() {
    startTransition(async () => {
      await action();
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" className={className} disabled={pending} onClick={() => setOpen(true)}>
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <button
            type="button"
            aria-label="Close confirmation"
            className="absolute inset-0 cursor-default bg-ink/60 backdrop-blur-[2px]"
            onClick={() => !pending && setOpen(false)}
          />
          <div className="relative w-full max-w-md border border-line bg-cream p-6 shadow-2xl sm:p-7">
            <p className="eyebrow">Please confirm</p>
            <h2 id="confirm-title" className="mt-3 font-display text-2xl text-ink">
              {label}
            </h2>
            <p className="mt-2 text-[12px] leading-6 text-muted">{confirmMessage}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={pending}
                onClick={confirm}
              >
                {pending ? "Working…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}