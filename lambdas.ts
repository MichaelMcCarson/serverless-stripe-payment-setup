import type { CreateFunctionRequest } from "@aws-sdk/client-lambda";

export type LambdaConfig = Omit<CreateFunctionRequest, "Code"> & {
  Region: string;
};

const environments = ["development", "staging", "production"];

const lambdas: LambdaConfig[] = [];

const awsAccount = process.env.AWS_ACCOUNT ?? "";

for (const environment of environments) {
  lambdas.push({
    Region: "us-east-1",
    FunctionName: `stripe-eventbridge-${environment}-stripe-webhook`,
    Role: `arn:aws:iam::${awsAccount}:role/payment-processing-eventbridge-setup-${environment}-role`,
    Runtime: "nodejs18.x",
    Handler: "index.handler",
    Description: "Listen to Event Bridge for payment processing events.",
    Tags: {
      environment,
      applicationRole: "infrastructure",
    },
  });
}

export default lambdas;
