console.log("Note Extension content script injected");

// Content.ts file is a script file that allows us interact with the web page (essentially DOM elements)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

    // keep processing text
    console.log("Opening note taker for text:", request.selectedText);
    const noteBox = document.createElement("div");
    noteBox.className = "note-box";

    noteBox.innerHTML = `
    <div class="note-selected-text">
      Selected text: "${request.selectedText}"
    </div>

    <textarea class="note-textarea"></textarea>

    <div class="note-actions">
      <button id="save_note_btn">Save Note</button>
      <button id="close_note_btn">Close</button>
    </div>
  `;

    //mouse position
    let startX = 0;
    let startY = 0;

    // element position
    let startLeft = 0;
    let startTop = 0;
    let isDragging = false;
    let isDetached = false;

    const detachNoteBox = (): void => {
      // reason for this function is because we need to erase the value of transform so we can
      // correctly place the box without any transformation logic
      if (isDetached) return;
      isDetached = true;

      // when we detach the box, the box should stay where they are
      const rect = noteBox.getBoundingClientRect();

      noteBox.style.left = `${rect.left}px`;
      noteBox.style.top = `${rect.top}px`;

      noteBox.style.transform = "none";
    };

    noteBox.addEventListener("mousedown", (e: MouseEvent) => {
      // mousedown event triggers the box to be detached and draggable
      detachNoteBox();
      isDragging = true;

      // calculate the current cursor position
      startX = e.clientX;
      startY = e.clientY;

      // calculate the current element position
      startLeft = noteBox.offsetLeft;
      startTop = noteBox.offsetTop;

      noteBox.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e: MouseEvent) => {
      if (!isDragging) return;

      // calculate how far the mouse has moved
      const dx: number = e.clientX - startX;
      const dy: number = e.clientY - startY;

      // apply the same amount of distance moved to the element
      noteBox.style.left = `${startLeft + dx}px`;
      noteBox.style.top = `${startTop + dy}px`;
      
    });

    document.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.userSelect = "";
      noteBox.style.cursor = "default";
      
    });

    document.body.appendChild(noteBox);

    function closeNoteBox(): void {
      noteBox.remove();
      document.removeEventListener("keydown", escHandler);
    }

    function saveNote(): void {
      noteBox.remove();
      document.removeEventListener("keydown", enterHandler);
    }

    const escHandler = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        closeNoteBox();
      }
    };

    const enterHandler = (e: KeyboardEvent): void => {
      if (e.key === "Enter" && e.ctrlKey) {
        saveNote();
      }
    };

    document.addEventListener("keydown", escHandler);
    document.addEventListener("keydown", enterHandler);

    const closeBtn =
      noteBox.querySelector<HTMLButtonElement>("#close_note_btn");
    if (!closeBtn) {
      throw new Error("close_note_btn not found");
    }

    closeBtn.addEventListener("click", closeNoteBox);

    const saveBtn = noteBox.querySelector(
      "#save_note_btn",
    ) as HTMLButtonElement;

    saveBtn.addEventListener("click", () => {
      const noteText = noteBox.querySelector("textarea") as HTMLTextAreaElement;
      console.log("Saving note:", noteText.value);
      document.body.removeChild(noteBox);
    });

    sendResponse({ statusCode: 200 });
  }

  return true;
});
