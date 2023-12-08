/*
This will make sure that the filtering is activated by default when upgrading from older versions, which used
dynamic injection and also upon initial installations.
 */
chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.sync.get({ active: true }).then(result => {
    chrome.storage.sync.set({ active: result.active })
  })
})
