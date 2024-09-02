import type { PutEventsCommandInput } from '@aws-sdk/client-eventbridge';
import { EventBridge } from '@aws-sdk/client-eventbridge';

const eventBridge = new EventBridge();

interface Event {
  id: string;
  type: string;
}

export async function sendToEventBridge(
  bridgeName: string,
  event: Event,
  source: string,
): Promise<void> {
  const { id, type } = event;

  // eslint-disable-next-line no-console -- remove for lambda logs.
  console.log(
    `${source}: Sending event ${id} of type ${type} to the ${bridgeName} event bus on AWS EventBridge`,
  );

  const params: PutEventsCommandInput = {
    Entries: [
      {
        Detail: JSON.stringify(event),
        DetailType: type,
        EventBusName: bridgeName,
        Resources: [],
        Source: source,
        Time: new Date(),
      },
    ],
  };

  await eventBridge.putEvents(params);
}
