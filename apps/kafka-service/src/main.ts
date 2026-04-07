import {kafka} from "@packages/utils/kafka";


const consumer = kafka.consumer({ groupId: 'user-events-group' });

const eventQueue: any[] = [];

const processQueue = async () => {
  if(eventQueue.length === 0) return;
  
  const events = [...eventQueue];
  eventQueue.length = 0;

  for(const event of events) {
    if(event.action === "shop_visit") {
      // update shop analytics
    }

    const validActions = [
      "add_to_wishlist",
      "remove_from_wishlist",
      "add_to_cart",
      "remove_from_cart",
      "product_view",
    ]

    if(!event.actions || !validActions.includes(event.action)) continue;

    try {
      await updateUserAnalytics(event);
    } catch (error) {
      console.log("Error processing event", error);
    }
  }
}

setInterval(processQueue, 3000);

//kafka consumer for user events
export const consumerKafkaMessages = async () => {
  // connect to the kafka broker
  await consumer.connect();
  // subscribe to the topic
  await consumer.subscribe({ topic: 'users_events', fromBeginning: false });
  // consume messages
  await consumer.run({
    eachMessage: async ({ message }) => {
      if(!message.value) return;
      const event = JSON.parse(message.value.toString());
      eventQueue.push(event);
    },
  });
}

consumerKafkaMessages().catch(console.error);