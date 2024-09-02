Borrowed and modified from [Rangle.io](https://github.com/rangle/stripe-eventbridge) to keep setup simple.

## Introduction

This repository sets up a serverless integration between Stripe and AWS EventBridge for webhook events. It deploys a Lambda webhook endpoint responsible for validating incoming events from Stripe. If the validation is successful, the event is then forwarded to AWS EventBridge for downstream applications to consume.

## Setup

1. Install the serverless framework: npm i -g serverless
2. Deploy the stack containing the dependencies: `cd stacks && sls deploy && cd ..`
3. This creates a Secret slot and an SNS queue for notifications about failed validations.
4. Deploy the function: `sls deploy`
5. Once deployed, note the URL of the deployed function in the output.
6. Login to the [https://dashboard.stripe.com/](Stripe Dashboard) and go to `Developers > Webhooks` and create a new endpoint.
7. Paste in the URL of the deployed function and choose which events you want to send to it.
8. Save it, then reopen it and Click to reveal the signing secret.
9. Copy the value of the signing secret then open the AWS Secrets Manager console.
10. Look for the Secret named `development/stripe/stripe-webhook-secret`, click on Set Secret Value and paste the signing secret in as plaintext.

The deployed function utilizes this secret to validate the signature of incoming events, ensuring they originate from Stripe before accepting them onto the EventBridge.

That's it! Test by sending a webhook event from the Stripe Dashboard, and it will be added to AWS EventBridge.

## EventBridge Configuration

Now, you can create rules in CloudWatch Events to match specific patterns and route events based on their type to desired endpoints (e.g., Lambdas). This setup ensures that events have already undergone signature validation.

For instance, to select all `payment_intent.succeeded` events, use the following pattern:

```json
{
  "detail-type": ["payment_intent.succeeded"],
  "source": ["Stripe"]
}
```

Note: If you're using the Serverless Framework to create Lambdas for handling these events, the YAML syntax for triggering EventBridge would be:

```yaml
functions:
  myLambdaFunction:
    handler: handler.myLambdaFunction
    events:
      - eventBridge:
          pattern:
            source:
              - Stripe
            detail-type:
              - payment_intent.succeeded
```

## Environment Variables

You will need an .env file with

```env
FAILURE_SNS=
EVENT_BRIDGE=default
ENDPOINT_SECRET=
```
