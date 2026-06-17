import { useEffect } from "react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import type { EventLogEntry, EventLogSource } from "@/types/event-log.types";

interface EventPanelProps {
  entries: EventLogEntry[];
  scrollRef: RefObject<HTMLDivElement | null>;
  onClear: () => void;
}

const sourceColorClasses: Record<EventLogSource, string> = {
  system: "text-primary",
  ws: "text-foreground",
  api: "text-foreground",
};

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatPayload(payload: unknown): string | null {
  if (payload === undefined) {
    return null;
  }

  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

export function EventPanel({ entries, scrollRef, onClear }: EventPanelProps) {
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [entries, scrollRef]);

  return (
    <div className="flex min-h-0 flex-1 flex-col border-b border-border">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
        <span className="text-sm font-medium text-muted">Eventos</span>
        <Button variant="secondary" onClick={onClear}>
          Clear
        </Button>
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4 font-mono text-sm">
        {entries.length === 0 ? (
          <p className="text-muted">Nenhum evento registrado.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {entries.map((entry) => {
              const payloadText = formatPayload(entry.payload);

              return (
                <div key={entry.id} className={sourceColorClasses[entry.source]}>
                  <div>
                    [{formatTimestamp(entry.timestamp)}] {entry.event}
                  </div>
                  {payloadText ? (
                    <pre className="mt-1 whitespace-pre-wrap text-xs text-muted">{payloadText}</pre>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
