const mapNetworkLog = new Map();
let tabPathName = "";
const blacklistUrl = [];
let state = false;

chrome.debugger.onEvent.addListener(function (source, method, params) {
  if (params.type === "XHR") {
    if (method === 'Network.requestWillBeSent') {
      if (containsBlacklistedWord(params.request.url, blacklistUrl)) return;
      if (params.request.method === "POST") {
        const splitUrl = params.request.url.split("/");
        const splitUrlLen = splitUrl.length;
        if (splitUrlLen < 4) return;
        const uri = `${splitUrl[splitUrlLen-2]}/${splitUrl[splitUrlLen-1]}`;
        mapNetworkLog.set(uri, 1);
      }
    }
  }
});

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (message) {
    if (message.action == "getNetworkLog") {
      const data = {
        data: {
          path: tabPathName,
          apis: [...mapNetworkLog.entries().map(([k]) => k)],
          count: [...mapNetworkLog.entries().map(([k]) => k)].length,
        },
        isDownload: false,
      };
      port.postMessage(data)
    }
    else if (message.action === "clearNetworkLog") {
      mapNetworkLog.clear();
    }
    else if (message.action == "toggleState") {
      state = !state;
      if (state) {
        chrome.action.setBadgeText({text: "ON"});
        chrome.scripting.executeScript({
          target : {tabId: message.tab.id},
          func : () => null
        }).then(() => contentAlert(message.tab));
      } else {
        chrome.action.setBadgeText({text: ""});
        chrome.debugger.detach({
          tabId: message.tab.id
        }).then(() => console.log("debugger detached..."))
      }
    }
    else if (message.action === 'downloadData') {
      const data = {
        data: {
          path: tabPathName,
          apis: [...mapNetworkLog.entries().map(([k]) => k)],
          count: [...mapNetworkLog.entries().map(([k]) => k)].length,
        },
        isDownload: true,
      };
      port.postMessage(data)
    }
  })
})


function containsBlacklistedWord(inputString, blacklist) {
  if (blacklist.length === 0) return;
  // Convert the input string to lowercase for case-insensitive comparison
  const lowerInput = inputString.toLowerCase();

  // Check if any blacklisted word is found in the input string
  for (let word of blacklist) {
      // Convert the blacklisted word to lowercase for case-insensitive comparison
      const lowerWord = word.toLowerCase();
      
      // Check if the blacklisted word is part of the input string
      if (lowerInput.includes(lowerWord)) {
          return true; // Found a blacklisted word
      }
  }

  return false; // No blacklisted word found
}

chrome.debugger.onDetach.addListener(function (source) {
  console.log("debugger detached...");
  state = !state;
  chrome.action.setBadgeText({text: ""});
})

function contentAlert(tab) {
  if (tab.url.startsWith('http')) {
    tabPathName = getTabPath(tab.url, tab.favIconUrl);
    chrome.debugger.attach({ tabId: tab.id }, '1.2', function () {
      chrome.debugger.sendCommand(
        { tabId: tab.id },
        'Network.enable',
        {},
        function () {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        }
      );
    });
  } else {
    console.log('Debugger can only be attached to HTTP/HTTPS pages.');
  }
}

function getTabPath(url, ico) {
  const baseUrl = ico.split("/favicon.ico");
  const tempPath = url.split(baseUrl[0]);
  if (!tempPath[1].includes("?")) return tempPath[1];
  const strippedPath = tempPath[1].split("?");
  return strippedPath[0];
}
