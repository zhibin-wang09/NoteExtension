import { stat } from "fs";

console.log("Note Extension content script injected");

// Content.ts file is a script file that allows us interact with the web page (essentially DOM elements)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "open_note_taker") {
    console.log("note taker opened");
  }
  sendResponse({ statusCode: 200 });
  return true;
});
