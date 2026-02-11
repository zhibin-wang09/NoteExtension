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

interface Note {
  selectedText: string;
  textArea: string;
}

export function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");

  useEffect(() => {
    chrome.storage.local.get(null, (items: Record<string, any>) => {
      const tmpNotes: Note[] = [];
      for (const [key, value] of Object.entries(items)) {
          tmpNotes.push({selectedText: key, textArea: value});
      }
      setNotes(tmpNotes);
    });
  }, []);

  function deleteNote(selectedText: string) {
    chrome.storage.local.remove([selectedText])
    setNotes(notes.filter(note => note.selectedText !== selectedText))
  }

  function editNote(index: number) {
    setEditingIndex(index);
    setEditText(notes[index].textArea);
  }

  function saveNote(index: number, selectedText: string) {
    const updatedNotes = [...notes];
    updatedNotes[index].textArea = editText;
    setNotes(updatedNotes);
    chrome.storage.local.set({[selectedText]: firstCharCap(editText)});
    setEditingIndex(null);
  }

  function cancelEdit() {
    setEditingIndex(null);
    setEditText("");
  }

  return (
    <ScrollArea>
      <ItemGroup className="flex flex-col gap-6 w-100 p-8">
        {notes.map((note, index) => (
          <Item key={note.selectedText} variant="outline">
            <ItemContent>
              <ItemTitle>{note.selectedText}</ItemTitle>
              {editingIndex === index ? (
                <Textarea
                  placeholder="Edit your note..."
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="mt-2"
                />
              ) : (
                <ItemDescription>{note.textArea}</ItemDescription>
              )}
            </ItemContent>
            <ItemActions>
              {editingIndex === index ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => saveNote(index, note.selectedText)}>
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => editNote(index)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteNote(note.selectedText)}>
                    Delete
                  </Button>
                </>
              )}
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </ScrollArea>
  );
}

export default App;
