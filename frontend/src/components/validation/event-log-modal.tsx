import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EventLogContent } from "@/components/validation/event-panel";
import type { EventLogEntry } from "@/types/event-log.types";

interface EventLogModalProps {
  open: boolean;
  onClose: () => void;
  entries: EventLogEntry[];
  scrollRef: RefObject<HTMLDivElement | null>;
  onClear: () => void;
}

export function EventLogModal({ open, onClose, entries, scrollRef, onClear }: EventLogModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Eventos">
      <div className="flex min-h-0 flex-col" style={{ maxHeight: "calc(80vh - 57px)" }}>
        <div className="flex shrink-0 justify-end border-b border-border px-4 py-2">
          <Button variant="secondary" onClick={onClear}>
            Clear
          </Button>
        </div>
        <EventLogContent entries={entries} scrollRef={scrollRef} />
      </div>
    </Modal>
  );
}
