// Background script (service worker) for NoteExtension
console.log("NoteExtension background script loaded");

// Add event listeners here for extension lifecycle events
chrome.runtime.onInstalled.addListener(() => {
  console.log("NoteExtension installed");
});