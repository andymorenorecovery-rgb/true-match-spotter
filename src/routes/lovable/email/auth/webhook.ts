import * as React from 'react'
import { createAuthEmailHandler } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'
import { SignupEmail } from '@/lib/email-templates/signup'
import { InviteEmail } from '@/lib/email-templates/invite'
import { MagicLinkEmail } from '@/lib/email-templates/magic-link'
import { RecoveryEmail } from '@/lib/email-templates/recovery'
import { EmailChangeEmail } from '@/lib/email-templates/email-change'
import { ReauthenticationEmail } from '@/lib/email-templates/reauthentication'

// Configuration
const SITE_NAME = "Ready Too Mingle"
const SENDER_DOMAIN = "notify.readytoomingle.com"
const ROOT_DOMAIN = "readytoomingle.com"
const FROM_DOMAIN = "readytoomingle.com"
const SITE_URL = `https://${ROOT_DOMAIN}`

// The SDK handler owns verification, dispatch, and retry semantics; this file
// owns only the email decisions: subjects, templates, and per-type props.
export const Route = createFileRoute("/lovable/email/auth/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']
        if (!apiKey) {
          // Self-hosted (no injected LOVABLE_API_KEY): relay the signed request
          // unchanged to the Lovable-hosted copy, which holds the managed email
          // key and performs verification + sending there.
          const relayUrl =
            process.env['EMAIL_WEBHOOK_RELAY_URL'] ??
            'https://true-match-spotter.lovable.app/lovable/email/auth/webhook'
          const headers = new Headers(request.headers)
          headers.delete('host')
          const upstream = await fetch(relayUrl, {
            method: 'POST',
            headers,
            body: await request.text(),
          })
          return new Response(upstream.body, {
            status: upstream.status,
            headers: {
              'content-type':
                upstream.headers.get('content-type') ?? 'application/json',
            },
          })
        }
        const handler = createAuthEmailHandler({
          apiKey,
          from: { name: SITE_NAME, address: `readytoomingle@${FROM_DOMAIN}` },
          senderDomain: SENDER_DOMAIN,
          sendUrl: process.env['LOVABLE_SEND_URL'],
          emails: {
            signup: {
              subject: 'Confirm your email',
              render: (data) =>
                React.createElement(SignupEmail, {
                  siteName: SITE_NAME,
                  siteUrl: SITE_URL,
                  recipient: data.email,
                  confirmationUrl: data.url,
                }),
            },
            invite: {
              subject: "You've been invited",
              render: (data) =>
                React.createElement(InviteEmail, {
                  siteName: SITE_NAME,
                  siteUrl: SITE_URL,
                  confirmationUrl: data.url,
                }),
            },
            magiclink: {
              subject: 'Your login link',
              render: (data) =>
                React.createElement(MagicLinkEmail, {
                  siteName: SITE_NAME,
                  confirmationUrl: data.url,
                }),
            },
            recovery: {
              subject: 'Reset your password',
              render: (data) =>
                React.createElement(RecoveryEmail, {
                  siteName: SITE_NAME,
                  confirmationUrl: data.url,
                }),
            },
            email_change: {
              subject: 'Confirm your new email',
              render: (data) =>
                React.createElement(EmailChangeEmail, {
                  siteName: SITE_NAME,
                  oldEmail: data.old_email ?? '',
                  email: data.email,
                  newEmail: data.new_email ?? '',
                  confirmationUrl: data.url,
                }),
            },
            reauthentication: {
              subject: 'Your verification code',
              render: (data) =>
                React.createElement(ReauthenticationEmail, { token: data.token ?? '' }),
            },
          },
        })
        return handler(request)
      },
    },
  },
})
