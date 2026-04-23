import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { firstCharCap } from "@/util/util";
import { Textarea } from "@/components/ui/textarea";
import type { StoredNote } from "@/types/note";

type PopupNote = StoredNote & { url: string };

export function App() {
  const [notes, setNotes] = useState<PopupNote[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [showAll, setShowAll] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      setCurrentUrl(tab?.url ?? "");
    });

    chrome.storage.local.get(null, (items: Record<string, StoredNote[]>) => {
      const flat: PopupNote[] = [];
      for (const [url, storedNotes] of Object.entries(items)) {
        if (Array.isArray(storedNotes)) {
          for (const note of storedNotes) {
            flat.push({ ...note, url });
          }
        }
      }
      setNotes(flat);
    });
  }, []);

  function sendToActiveTab(message: Record<string, unknown>) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) chrome.tabs.sendMessage(tab.id, message);
    });
  }

  function deleteNote(url: string, id: string) {
    chrome.storage.local.get(url, (result) => {
      const existing = (result[url] as StoredNote[]) ?? [];
      const updated = existing.filter((n) => n.id !== id);
      const afterWrite = () => sendToActiveTab({ action: "remove_highlight", noteId: id });
      if (updated.length === 0) {
        chrome.storage.local.remove(url, afterWrite);
      } else {
        chrome.storage.local.set({ [url]: updated }, afterWrite);
      }
    });
    setNotes((prev) => prev.filter((n) => !(n.url === url && n.id === id)));
  }

  function startEdit(note: PopupNote) {
    setEditingId(note.id);
    setEditText(note.noteText);
  }

  function saveNote(url: string, id: string) {
    const saved = firstCharCap(editText);
    chrome.storage.local.get(url, (result) => {
      const existing = (result[url] as StoredNote[]) ?? [];
      const updated = existing.map((n) =>
        n.id === id ? { ...n, noteText: saved } : n
      );
      chrome.storage.local.set({ [url]: updated }, () =>
        sendToActiveTab({ action: "update_note", noteId: id, noteText: saved })
      );
    });
    setNotes((prev) =>
      prev.map((n) =>
        n.url === url && n.id === id ? { ...n, noteText: saved } : n
      )
    );
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  function highlightNote(note: PopupNote) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return;
      chrome.tabs.sendMessage(tab.id, {
        action: "highlight_note",
        noteId: note.id,
        selectedText: note.selectedText,
      });
    });
  }

  function renderNote(note: PopupNote) {
    const isEditing = editingId === note.id;
    return (
      <Item key={note.id} variant="outline" className="flex-col items-start">
        <ItemContent>
          <ItemTitle>{note.selectedText}</ItemTitle>
          {isEditing ? (
            <Textarea
              placeholder="Edit your note..."
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="mt-2"
            />
          ) : (
            <ItemDescription className="line-clamp-none max-h-32 overflow-y-auto">{note.noteText}</ItemDescription>
          )}
        </ItemContent>
        <ItemActions>
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveNote(note.url, note.id)}
              >
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={cancelEdit}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => highlightNote(note)}
              >
                Highlight
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => startEdit(note)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteNote(note.url, note.id)}
              >
                Delete
              </Button>
            </>
          )}
        </ItemActions>
      </Item>
    );
  }

  const visibleNotes = showAll
    ? notes
    : notes.filter((n) => n.url === currentUrl);

  const grouped = notes.reduce<Record<string, PopupNote[]>>((acc, note) => {
    (acc[note.url] ??= []).push(note);
    return acc;
  }, {});

  return (
    <ScrollArea>
      <div className="flex justify-end px-8 pt-4">
        <Button
          variant={showAll ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? "All pages" : "This page"}
        </Button>
      </div>

      <div className="flex flex-col gap-6 w-100 p-8 pt-4">
        {showAll ? (
          Object.entries(grouped).map(([url, groupNotes]) => (
            <div key={url}>
              <p className="text-xs text-muted-foreground px-1 pb-2 truncate">
                {url}
              </p>
              <ItemGroup className="flex flex-col gap-2">
                {groupNotes.map(renderNote)}
              </ItemGroup>
            </div>
          ))
        ) : (
          <ItemGroup className="flex flex-col gap-2">
            {visibleNotes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No notes for this page.
              </p>
            ) : (
              visibleNotes.map(renderNote)
            )}
          </ItemGroup>
        )}
      </div>
    </ScrollArea>
  );
}

export default App;
