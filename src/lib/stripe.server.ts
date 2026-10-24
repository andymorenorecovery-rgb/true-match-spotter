import Stripe from 'stripe';
const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not configured`);
  return value;
};

export type StripeEnv = 'sandbox' | 'live';

const GATEWAY_STRIPE_BASE = 'https://connector-gateway.lovable.dev/stripe';
const API_VERSION = '2026-03-25.dahlia' as const;

export type EnvRecord = Record<string, string | undefined>;

/** The owner's own Stripe secret key. Only present on a build hosted outside Lovable. */
export function directSecretKey(env: StripeEnv, e: EnvRecord = process.env): string | undefined {
  return env === 'sandbox'
    ? e['STRIPE_SANDBOX_SECRET_KEY'] ?? e['STRIPE_SECRET_KEY']
    : e['STRIPE_LIVE_SECRET_KEY'] ?? e['STRIPE_SECRET_KEY'];
}

/** True when this build talks to Stripe itself instead of through Lovable's gateway. */
export function isDirectStripe(env: StripeEnv, e: EnvRecord = process.env): boolean {
  return Boolean(directSecretKey(env, e));
}

/** Managed payments is a Lovable-gateway feature; a build using its own Stripe key must not send it. */
export function checkoutExtras(env: StripeEnv, e: EnvRecord = process.env): Record<string, unknown> {
  return isDirectStripe(env, e) ? {} : { managed_payments: { enabled: true } };
}

export function getConnectionApiKey(env: StripeEnv): string {
  return env === 'sandbox'
    ? getEnv('STRIPE_SANDBOX_API_KEY')
    : getEnv('STRIPE_LIVE_API_KEY');
}

// Uses the owner's own Stripe key when the host provides one; otherwise routes
// api.stripe.com requests through the connector gateway.
export function createStripeClient(env: StripeEnv): Stripe {
  const secret = directSecretKey(env);
  if (secret) return new Stripe(secret, { apiVersion: API_VERSION });

  const connectionApiKey = getConnectionApiKey(env);
  const lovableApiKey = getEnv('LOVABLE_API_KEY');

  return new Stripe(connectionApiKey, {
    apiVersion: API_VERSION,
    httpClient: Stripe.createFetchHttpClient((input, init) => {
      const stripeUrl = input instanceof Request ? input.url : input.toString();
      const gatewayUrl = stripeUrl.replace('https://api.stripe.com', GATEWAY_STRIPE_BASE);
      return fetch(gatewayUrl, {
        ...init,
        headers: {
          ...Object.fromEntries(
            new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined)).entries(),
          ),
          'X-Connection-Api-Key': connectionApiKey,
          'Lovable-API-Key': lovableApiKey,
        },
      });
    }),
  });
}

export function getStripeErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const stripeError = error as {
      message?: string;
      type?: string;
      code?: string;
      decline_code?: string;
      param?: string;
      requestId?: string;
      raw?: {
        message?: string;
        type?: string;
        code?: string;
        decline_code?: string;
        param?: string;
        requestId?: string;
      };
    };

    const message = stripeError.raw?.message ?? stripeError.message;
    if (message) {
      const details = [
        stripeError.raw?.type ?? stripeError.type,
        stripeError.raw?.code ?? stripeError.code,
        stripeError.raw?.decline_code ?? stripeError.decline_code,
        stripeError.raw?.param ?? stripeError.param,
        stripeError.raw?.requestId ?? stripeError.requestId,
      ].filter(Boolean);
      return details.length ? `${message} (${details.join(', ')})` : message;
    }
  }

  return 'Stripe request failed';
}
