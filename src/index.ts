import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import stripe from 'stripe';
import * as eventBridge from '../lib/eventbridge';
import * as sns from '../lib/sns';

const secretName = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET;
const webhookSourceName = process.env.WEBHOOK_SOURCE_NAME ?? 'Stripe';
const client = new SecretsManager();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  let error: Error | null = null;

  try {
    const signature = event.headers['Stripe-Signature'];
    const secret = (await client.getSecretValue({ SecretId: secretName })).SecretString;
    const eventReceived = stripe.webhooks.constructEvent(
      event.body ?? '',
      signature ?? '',
      secret ?? '',
    );
    await eventBridge.sendToEventBridge(
      process.env.EVENT_BRIDGE ?? '',
      eventReceived,
      webhookSourceName,
    );
  } catch (err) {
    error = err;
    await sns.notifyFailure(err.message);
  }

  const body = error ? JSON.stringify(error) : '';
  const statusCode = error ? 500 : 200;

  return {
    statusCode,
    body,
  };
}
