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
    noteBox.style.position = "fixed";
    noteBox.style.top = "50%";
    noteBox.style.left = "50%";
    noteBox.style.transform = "translate(-50%, -50%)";
    noteBox.style.width = "300px";
    noteBox.style.height = "200px";
    noteBox.style.backgroundColor = "white";
    noteBox.style.border = "2px solid black";
    noteBox.style.zIndex = "10000";
    noteBox.style.padding = "10px";
    noteBox.innerHTML = `
        <text>Selected text: "${request.selectedText}"</text>
        <br/>
        <textarea style="width: 100%; height: 70%;"></textarea>
        <br/>
        <button id="save_note_btn">Save Note</button>
        <button id="close_note_btn">Close</button>
        `;
    document.body.appendChild(noteBox);

    const closeBtn = noteBox.querySelector(
      "#close_note_btn",
    ) as HTMLButtonElement;
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(noteBox);
    });

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
