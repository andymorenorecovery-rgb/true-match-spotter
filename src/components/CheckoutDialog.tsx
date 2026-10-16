import { useCallback } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckoutSession } from "@/utils/payments.functions";

export type CheckoutRequest = { priceIds: string[]; adId: string; kind: "post" | "boost" };

export function CheckoutDialog({ request, onClose }: { request: CheckoutRequest | null; onClose: () => void }) {
  const fetchClientSecret = useCallback(async () => {
    const r = await createCheckoutSession({
      data: {
        ...request!,
        returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        environment: getStripeEnvironment(),
      },
    });
    if ("error" in r) throw new Error(r.error);
    return r.clientSecret;
  }, [request]);

  return (
    <Dialog open={!!request} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto bg-card p-4">
        <DialogTitle>Checkout</DialogTitle>
        {request && (
          <EmbeddedCheckoutProvider key={request.adId + request.kind} stripe={getStripe()} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}
