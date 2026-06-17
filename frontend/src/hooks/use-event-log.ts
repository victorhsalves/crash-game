import { useCallback, useRef, useState } from "react";
import type { EventLogEntry, EventLogSource } from "@/types/event-log.types";

export const MAX_LOG_ENTRIES = 500;

function createEntryId(): string {
  return crypto.randomUUID();
}

export function useEventLog() {
  const [entries, setEntries] = useState<EventLogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const append = useCallback(
    (source: EventLogSource, event: string, payload?: unknown) => {
      const entry: EventLogEntry = {
        id: createEntryId(),
        timestamp: new Date(),
        source,
        event,
        payload,
      };

      setEntries((current) => {
        const next = [...current, entry];
        if (next.length > MAX_LOG_ENTRIES) {
          return next.slice(next.length - MAX_LOG_ENTRIES);
        }
        return next;
      });
    },
    [],
  );

  const clear = useCallback(() => {
    setEntries([]);
  }, []);

  return { entries, append, clear, scrollRef };
}
