/* eslint-disable no-console -- disable for lambda */
import { SNS } from '@aws-sdk/client-sns';

export async function notifyFailure(message: string): Promise<void> {
  try {
    console.log('Error while handling webhook', message);
    if (process.env.FAILURE_SNS) {
      console.log(`Sending failure notification to SNS topic ${process.env.FAILURE_SNS}`);
      await new SNS({ apiVersion: '2010-03-31' }).publish({
        Message: message,
        TopicArn: process.env.FAILURE_SNS,
      });
    } else {
      console.log('Skipped sending failure notification, no SNS topic is configured');
    }
  } catch (e) {
    console.error('Error while notifying via SNS', e.message);
  }
}
