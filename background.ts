// Background script (service worker) for NoteExtension
console.log("NoteExtension background script loaded");

// Add event listeners here for extension lifecycle events
chrome.runtime.onInstalled.addListener(() => {
  console.log("NoteExtension installed");
});

chrome.contextMenus.create(
  {
    title: "Add Note",
    visible: true,
    id: "add_note",
    contexts: ["all"],
    documentUrlPatterns: ["<all_urls>"],
  },
  () => {
    console.log("Context menu item 'Add Note' created");
  },
);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "add_note") {
    // call the content script to create a pop up to add note
    console.log(tab);
    chrome.tabs.sendMessage(
      tab!.id!,
      { action: "open_note_taker" },
      (response) => {
        console.log(response)
      },
    );
  }
  return true;
});
