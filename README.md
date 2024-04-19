# API Logger Extension
<p align="center">
  <img src="ale.png" />
</p>

Helps to capture request network events on web pages using the chrome.debugger API. Will only capture network with type XHR and network that don't request .json file.

### How to Install
1. clone this repo or download the source from [here](https://github.com/rndconfins/api-logger-extension/archive/refs/tags/v1.0.0.zip)
2. Open chrome extension config and turn on developer mode
3. On chrome extension config, load unpacked from the src folder
4. Pin the extension and you good to go

### How to Use
1. open menu/page that you want to track
2. open the extension and click `track API's` - a blue bar will appear on top indicates that the extension will capture all network events. do not close or cancel this that will result to stop the capture activity
3. run the page like usual
4. when you're done, click `cancel` or `x` button
5. open the extension and click `Retreive webRequest Log` - this will download a json file with all the network event captured
6. click `clear Log` to clear all the captured network