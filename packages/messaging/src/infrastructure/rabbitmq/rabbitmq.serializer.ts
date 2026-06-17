import type { IntegrationEventEnvelope } from "../../domain/integration-event-envelope";
import { MessagingError } from "../../domain/messaging-error";

function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class RabbitMqSerializer {
  public serialize<TPayload>(envelope: IntegrationEventEnvelope<TPayload>): Buffer {
    const json = JSON.stringify(envelope, jsonReplacer);
    return Buffer.from(json, "utf-8");
  }

  public deserialize<TPayload = unknown>(buffer: Buffer): IntegrationEventEnvelope<TPayload> {
    let parsed: unknown;

    try {
      parsed = JSON.parse(buffer.toString("utf-8"));
    } catch {
      throw new MessagingError("Failed to deserialize message: invalid JSON.");
    }

    if (!isRecord(parsed)) {
      throw new MessagingError("Failed to deserialize message: envelope must be an object.");
    }

    const { eventId, occurredAt, event } = parsed;

    if (typeof eventId !== "string" || eventId.length === 0) {
      throw new MessagingError("Failed to deserialize message: eventId is required.");
    }

    if (typeof occurredAt !== "string" || occurredAt.length === 0) {
      throw new MessagingError("Failed to deserialize message: occurredAt is required.");
    }

    if (!isRecord(event)) {
      throw new MessagingError("Failed to deserialize message: event is required.");
    }

    const { eventType, aggregateId, payload } = event;

    if (typeof eventType !== "string" || eventType.length === 0) {
      throw new MessagingError("Failed to deserialize message: event.eventType is required.");
    }

    if (typeof aggregateId !== "string" || aggregateId.length === 0) {
      throw new MessagingError("Failed to deserialize message: event.aggregateId is required.");
    }

    if (payload === undefined) {
      throw new MessagingError("Failed to deserialize message: event.payload is required.");
    }

    return {
      eventId,
      occurredAt,
      event: {
        eventType,
        aggregateId,
        payload: payload as TPayload,
      },
    };
  }
}
