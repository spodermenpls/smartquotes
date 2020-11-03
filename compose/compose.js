console.log('Injecting compose.js');

messenger.runtime.onMessage.addListener(popupListener);

function popupListener(message, sender, sendResponse) {
  switch (message.msg) {
    case "getConnected":
      sendResponse("Sure!");
      getBody();
    break;
  }
}

function getBody() {
  console.log(window.document.querySelector("html"));
}