import { paymentsClientToken } from "@/lib/stripe";

const clientToken = paymentsClientToken();

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full border-b border-destructive bg-destructive/15 px-4 py-2 text-center text-sm">
        Checkout isn't set up for the live site yet. Finish the go-live steps in the Payments tab.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full border-b border-boost bg-secondary px-4 py-2 text-center text-xs">
        Test mode — payments here use test cards and no real money is charged.
      </div>
    );
  }
  return null;
}
