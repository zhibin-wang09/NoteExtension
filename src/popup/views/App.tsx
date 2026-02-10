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


interface Note {
  selectedText: string;
  textArea: string;
}

export function App() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    chrome.storage.local.get(null, (items: Record<string, any>) => {
      const tmpNotes: Note[] = [];
      for (const [key, value] of Object.entries(items)) {
        console.log(items)
          tmpNotes.push({selectedText: key, textArea: value});
      }
      setNotes(tmpNotes);
    });
  }, []);

  function deleteNote(selectedText: string) {
    chrome.storage.local.remove([selectedText])
    setNotes(notes.filter(note => note.selectedText !== selectedText))
  }

  return (
    <ScrollArea>
      <ItemGroup className="flex flex-col gap-6 w-100 p-8">
        {notes.map((note) => (
          <Item key={note.selectedText} variant="outline">
            <ItemContent>
              <ItemTitle>{note.selectedText}</ItemTitle>
              <ItemDescription>{note.textArea}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => deleteNote(note.selectedText)}>
                Delete
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </ScrollArea>
  );
}

export default App;
