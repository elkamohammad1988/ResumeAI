#!/usr/bin/env bash
# Forward Stripe webhook events to the local backend.
#
# Prerequisites:
#   1. Install Stripe CLI: https://docs.stripe.com/stripe-cli
#   2. Run `stripe login` once to authenticate
#
# Usage:
#   ./scripts/stripe-listen.sh
#
# Copy the "Ready! Your webhook signing secret is whsec_..." into backend/.env
# as STRIPE_WEBHOOK_SECRET — that secret is unique per CLI session.

set -euo pipefail

echo "→ Forwarding webhooks to http://localhost:5000/api/billing/webhook"
echo "→ Copy the printed whsec_... into backend/.env as STRIPE_WEBHOOK_SECRET"
echo ""

stripe listen \
  --forward-to http://localhost:5000/api/billing/webhook \
  --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted
