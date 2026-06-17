export interface MessagingConfig {
  url: string;
  exchange: string;
  exchangeType: string;
}

export function buildMessagingConfig(): MessagingConfig {
  const url = process.env.RABBITMQ_URL;
  const exchange = process.env.RABBITMQ_EXCHANGE ?? "crash.events";
  const exchangeType = process.env.RABBITMQ_EXCHANGE_TYPE ?? "topic";

  if (!url) {
    throw new Error("RABBITMQ_URL is required to configure messaging.");
  }

  return { url, exchange, exchangeType };
}
