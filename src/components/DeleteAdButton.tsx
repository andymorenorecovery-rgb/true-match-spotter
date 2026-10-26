import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { deleteAdEverywhere } from "@/lib/ad-sync";

export function DeleteAdButton({ id, className, after }: { id: string; className?: string; after?: "home" }) {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  return (
    <button
      type="button"
      disabled={busy}
      className={className ?? "rounded-full bg-destructive px-3 py-1.5 text-xs text-destructive-foreground disabled:opacity-60"}
      onClick={async () => {
        if (!window.confirm("Delete this ad? It will be removed for everyone and can't be undone.")) return;
        setBusy(true);
        try {
          await deleteAdEverywhere(id);
          toast.success("Your ad was deleted.");
          if (after === "home") navigate({ to: "/" });
        } catch {
          toast.error("Couldn't delete the ad. Please try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
