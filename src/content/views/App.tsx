import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
import { firstCharCap } from "@/util/util";

function App() {
  const [isNoteBoxOpen, setIsNoteBoxOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startMouse, setStartMouse] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [textArea, setTextArea] = useState("");

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartMouse({ x: e.clientX, y: e.clientY });
    setStartPos({ x: position.x, y: position.y });
  };

  useEffect(() => {
    if (!isDragging) return;

    let frameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const dx = e.clientX - startMouse.x;
        const dy = e.clientY - startMouse.y;

        setPosition({
          x: startPos.x + dx,
          y: startPos.y + dy,
        });
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      cancelAnimationFrame(frameId);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(frameId);
    };
  }, [isDragging, startMouse, startPos]);

  const saveBtn = (e : React.FormEvent) => {
    e.preventDefault();
    chrome.storage.local.set({[firstCharCap(selectedText)]: firstCharCap(textArea)}).then(() => {
      console.log("Note saved to storage");
    });
    setIsNoteBoxOpen(false);
    setTextArea("");
    setSelectedText("");
  };

  const cancelBtn = () => {
    console.log("Note cancelled");
    setIsNoteBoxOpen(false);
  };

  useEffect(() => {
    if (isNoteBoxOpen) {
      // Set initial position to center-ish area
      setPosition({
        x: Math.max(0, (window.innerWidth - 425) / 2),
        y: Math.max(0, (window.innerHeight - 300) / 2),
      });
    }
  }, [isNoteBoxOpen]);

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

  return createPortal(
    <Dialog open={isNoteBoxOpen} onOpenChange={setIsNoteBoxOpen}>
      <form className="z-1000" onSubmit={saveBtn}>
        <DialogContent
          className="flex flex-col m-4"
          style={{
            position: "fixed",
            transform: `translate(${position.x}px, ${position.y}px)`,
            willChange: isDragging ? "transform" : "auto",
          }}
        >
          <DialogHeader
            onMouseDown={handleMouseDown}
            className="cursor-grab active:cursor-grabbing select-none flex flex-row"
          >
            <DialogTitle hidden>Add Note</DialogTitle>
            <DialogDescription>
              Add Notes about the selected text.
            </DialogDescription>
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
              <Button variant="outline" onClick={cancelBtn}>Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={saveBtn}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>,
    document.body,
  );
}


export default App;
