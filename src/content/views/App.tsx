import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { firstCharCap } from "@/util/util";
import type { StoredNote } from "@/types/note";

function removeHighlight(noteId: string): void {
  const marks = document.querySelectorAll(`mark[data-note-id="${noteId}"]`);
  for (const mark of marks) {
    const parent = mark.parentNode;
    if (!parent) continue;
    parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark);
    parent.normalize();
  }
}

function highlightText(text: string, noteId: string): void {
  if (!text || document.querySelector(`mark[data-note-id="${noteId}"]`)) return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest("#note_extension_container")) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  // Concatenate all text nodes to find matches that span element boundaries
  const entries: { node: Text; start: number }[] = [];
  let fullText = "";
  let current: Node | null;
  while ((current = walker.nextNode())) {
    const node = current as Text;
    entries.push({ node, start: fullText.length });
    fullText += node.textContent ?? "";
  }

  const matchIdx = fullText.toLowerCase().indexOf(text.toLowerCase());
  if (matchIdx === -1) return;

  const matchEnd = matchIdx + text.length;
  const overlapping = entries.filter(({ node, start }) => {
    const len = (node.textContent ?? "").length;
    return start + len > matchIdx && start < matchEnd;
  });

  for (const { node, start } of overlapping) {
    const content = node.textContent ?? "";
    const nodeMatchStart = Math.max(matchIdx - start, 0);
    const nodeMatchEnd = Math.min(matchEnd - start, content.length);
    const matched = content.slice(nodeMatchStart, nodeMatchEnd);
    if (!matched) continue;

    const mark = document.createElement("mark");
    mark.dataset.noteId = noteId;
    mark.textContent = matched;
    mark.style.cssText = "background-color: yellow !important; color: black !important; cursor: pointer !important;";

    const parent = node.parentNode!;
    const before = content.slice(0, nodeMatchStart);
    const after = content.slice(nodeMatchEnd);
    if (before) parent.insertBefore(document.createTextNode(before), node);
    parent.insertBefore(mark, node);
    if (after) parent.insertBefore(document.createTextNode(after), node);
    parent.removeChild(node);
  }
}

function App({ portalContainer }: { portalContainer: HTMLElement }) {
  const [isNoteBoxOpen, setIsNoteBoxOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [url, setUrl] = useState(window.location.href);
  const [textArea, setTextArea] = useState("");
  const [tooltipNote, setTooltipNote] = useState<StoredNote | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const dialogRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const highlightedNotesRef = useRef<StoredNote[]>([]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dialogRef.current) return;

    const rect = dialogRef.current.getBoundingClientRect();
    dialogRef.current.style.left = "0";
    dialogRef.current.style.top = "0";
    dialogRef.current.style.translate = "none";
    dialogRef.current.style.transform = `translate(${rect.left}px, ${rect.top}px)`;

    const startMouse = { x: e.clientX, y: e.clientY };
    const startPos = { x: rect.left, y: rect.top };

    isDragging.current = true;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dialogRef.current) return;
      const x = startPos.x + (e.clientX - startMouse.x);
      const y = startPos.y + (e.clientY - startMouse.y);
      dialogRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    if (!isNoteBoxOpen || !dialogRef.current) return;
    dialogRef.current.style.left = "";
    dialogRef.current.style.top = "";
    dialogRef.current.style.translate = "";
    dialogRef.current.style.transform = "";
  }, [isNoteBoxOpen]);

  // Auto-highlight saved notes for the current page on mount
  useEffect(() => {
    chrome.storage.local.get(window.location.href, (result) => {
      const notes = (result[window.location.href] as StoredNote[] | undefined) ?? [];
      highlightedNotesRef.current = notes;
      for (const note of notes) {
        highlightText(note.selectedText, note.id);
      }
    });
  }, []);

  // Delegate clicks on <mark> elements to show the inline tooltip
  useEffect(() => {
    const handleMarkClick = (e: MouseEvent) => {
      const mark = (e.target as HTMLElement).closest("mark[data-note-id]") as HTMLElement | null;
      if (!mark) return;

      const note = highlightedNotesRef.current.find((n) => n.id === mark.dataset.noteId);
      if (!note) return;

      const rect = mark.getBoundingClientRect();
      const tooltipWidth = 288; // w-72
      const tooltipHeight = 120;
      const x = Math.min(rect.left, window.innerWidth - tooltipWidth - 8);
      const y =
        rect.bottom + 8 + tooltipHeight > window.innerHeight
          ? rect.top - tooltipHeight - 8
          : rect.bottom + 8;

      setTooltipPos({ x, y });
      setTooltipNote(note);
      e.stopPropagation();
    };

    document.addEventListener("click", handleMarkClick);
    return () => document.removeEventListener("click", handleMarkClick);
  }, []);

  // Close tooltip on outside click or Escape
  useEffect(() => {
    if (!tooltipNote) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (!tooltipRef.current || !e.composedPath().includes(tooltipRef.current)) {
        setTooltipNote(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTooltipNote(null);
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [tooltipNote]);

  const saveBtn = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: StoredNote = {
      id: crypto.randomUUID(),
      selectedText,
      noteText: firstCharCap(textArea),
      createdAt: Date.now(),
    };
    chrome.storage.local.get(url, (result) => {
      const existing = (result[url] as StoredNote[] | undefined) ?? [];
      chrome.storage.local.set({ [url]: [...existing, newNote] });
    });
    highlightedNotesRef.current = [...highlightedNotesRef.current, newNote];
    highlightText(newNote.selectedText, newNote.id);
    setIsNoteBoxOpen(false);
    setTextArea("");
    setSelectedText("");
  };

  const cancelBtn = () => {
    setIsNoteBoxOpen(false);
  };

  useEffect(() => {
    const messageListener = (request: any, _: any, sendResponse: any) => {
      if (request.action === "open_note_taker") {
        if (request.mediaType === "image" || request.mediaType === "video") {
          alert("Media note taking is not supported yet.");
          sendResponse({ statusCode: 400, message: "Media note taking not supported" });
          return;
        }
        setSelectedText(request.selectedText);
        setIsNoteBoxOpen(true);
        if (request.url) setUrl(request.url);
        sendResponse({ statusCode: 200 });
      }

      if (request.action === "highlight_note") {
        highlightText(request.selectedText, request.noteId);
        const mark = document.querySelector(`mark[data-note-id="${request.noteId}"]`);
        mark?.scrollIntoView({ behavior: "smooth", block: "center" });
        sendResponse({ statusCode: 200 });
      }

      if (request.action === "remove_highlight") {
        removeHighlight(request.noteId);
        highlightedNotesRef.current = highlightedNotesRef.current.filter(
          (n) => n.id !== request.noteId
        );
        sendResponse({ statusCode: 200 });
      }

      if (request.action === "update_note") {
        highlightedNotesRef.current = highlightedNotesRef.current.map((n) =>
          n.id === request.noteId ? { ...n, noteText: request.noteText } : n
        );
        sendResponse({ statusCode: 200 });
      }

      return true;
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  return (
    <>
      <Dialog open={isNoteBoxOpen} onOpenChange={setIsNoteBoxOpen}>
        <form className="z-1000" onSubmit={saveBtn}>
          <DialogContent ref={dialogRef} className="flex flex-col m-4" container={portalContainer} aria-describedby="note-dialog-description">
            <DialogHeader
              onMouseDown={handleMouseDown}
              className="cursor-grab active:cursor-grabbing select-none flex flex-row"
            >
              <DialogTitle className="sr-only">Add Note</DialogTitle>
              <p id="note-dialog-description" className="text-muted-foreground text-sm">Add Notes about the selected text.</p>
            </DialogHeader>
            <div className="flex flex-col gap-4 my-4">
              <div className="flex flex-col gap-2 no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
                <Label htmlFor="selected-text">Selected Text:</Label>
                <div>
                  <p id="selected-text">{selectedText}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="note">Notes</Label>
                <Textarea
                  id="note"
                  name="note"
                  placeholder="Take notes..."
                  value={textArea}
                  onChange={(e) => setTextArea(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={cancelBtn}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" onClick={saveBtn}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>

      {tooltipNote &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{
              position: "fixed",
              left: tooltipPos.x,
              top: tooltipPos.y,
              zIndex: 2147483647,
            }}
            className="bg-background border rounded-lg shadow-lg p-3 w-72"
          >
            <p className="text-xs text-muted-foreground font-medium mb-1">Selected text</p>
            <p className="text-sm font-medium mb-2 line-clamp-2">{tooltipNote.selectedText}</p>
            <p className="text-xs text-muted-foreground font-medium mb-1">Note</p>
            <p className="text-sm">{tooltipNote.noteText}</p>
          </div>,
          portalContainer
        )}
    </>
  );
}

export default App;
