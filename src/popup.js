let data = {};

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

document.getElementById('toggleStateButton').addEventListener('click', async function() {
  const tab = await getCurrentTab();
  const port = chrome.runtime.connect({name:'test'});
  port.postMessage({action:"toggleState", tab: tab});
});

function getNetworkLog() {
port.postMessage({action:"downloadData"});
}

function clearNetworkLog() {
port.postMessage({action:"clearNetworkLog"});
port.postMessage({action:"getNetworkLog"});
}

const port = chrome.runtime.connect({name:'test'});

document.getElementById("theButton").addEventListener("click", getNetworkLog, false);
document.getElementById("clearButton").addEventListener("click", clearNetworkLog, false);

port.onMessage.addListener(function(msg) {
  data = msg.data;
  document.getElementById('pathNameDiv').innerHTML = JSON.stringify(data.path);
  document.getElementById('outputDiv').innerHTML = JSON.stringify(data.apis);
  document.getElementById('countDiv').innerHTML = `count: ${data.count}`;

  if (msg.isDownload) {
    downloadData();
  }
});

function removeTrackNet() {
document.getElementById("theButton").removeEventListener("click", getNetworkLog, false);
document.getElementById("clearButton").removeEventListener("click", clearNetworkLog, false);
}

function downloadData() {
  const fileName = data.path.substring(1).replace("/", "-");
  const buffer = genJsonBuffer(data);
  const mimeType = 'text/json;charset=UTF-8';
  const _id = new Date().getTime();

  const vLink = document.createElement('a'),
  vBlob = new Blob([buffer], {
    type: mimeType
  });
  vName = `${fileName}_${_id}.json`,
  vUrl = window.URL.createObjectURL(vBlob);
  vLink.setAttribute('href', vUrl);
  vLink.setAttribute('download', vName );
  vLink.click();
}


function genJsonBuffer(json) {
  return JSON.stringify(json, null, 2);
}

function saveAsFile(buffer, fileName, mimeType, extType) {
  const data = new Blob([buffer], {
    type: mimeType
  });
  const _id = new Date().getTime();
  const _filename = `${fileName}_${_id}${extType}`;
  window.saveAs(data, _filename);
}