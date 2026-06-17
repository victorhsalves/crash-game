export type EventLogSource = "ws" | "api" | "system";

export interface EventLogEntry {
  id: string;
  timestamp: Date;
  source: EventLogSource;
  event: string;
  payload?: unknown;
}
