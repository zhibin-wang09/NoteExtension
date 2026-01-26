import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function App() {
  const [isNoteBoxOpen, setIsNoteBoxOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  const saveBtn = () => {
    console.log("Note saved");
    setIsNoteBoxOpen(false);
  };

  const cancelBtn = () => {
    console.log("Note cancelled");
    setIsNoteBoxOpen(false);
  };

  useEffect(() => {
    const messageListener = (request: any, _: any, sendResponse: any) => {
      if (request.action === "open_note_taker") {
        // render a box to take note on the top right corner of the selected text
        // check if the highlighted text is an image or video or text

        if (request.mediaType === "image" || request.mediaType === "video") {
          alert("Media note taking is not supported yet.");
          sendResponse({
            statusCode: 400,
            message: "Media note taking not supported",
          });
          return;
        }

        setSelectedText(request.selectedText);
        setIsNoteBoxOpen(true);

        sendResponse({ statusCode: 200 });
      }
      return true;
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return (
    <Dialog open={isNoteBoxOpen} onOpenChange={setIsNoteBoxOpen}>
      <form className="z-1000">
        <DialogContent className="flex flex-col m-4">
          <DialogHeader>
            <DialogTitle hidden>Add Note</DialogTitle>
            <DialogDescription>
              Add Notes about the selected text.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 my-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="selected-text">Selected Text:</Label>
              <div>
                <p id="selected-text">{selectedText}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="note">Notes</Label>
              <Textarea id="note" name="note" placeholder="Take notes..." />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

export default App;
