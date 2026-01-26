import { useEffect, useState } from "react";

function App() {
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
        
        sendResponse({ statusCode: 200 });
      }
      return true;
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return <div className="text-red-500">Hello, Note Extension!</div>;
}

export default App;
