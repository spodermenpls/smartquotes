(async () => {

messenger.WindowListener.registerChromeUrl([ 
  ["content",  "smartquotes",           "jar:tbSmartQuotes.jar!/content/"],
  ["resource", "smartquotes",           "jar:smartquotes.jar!/skin/"],
  ["locale",   "smartquotes", "en-US",  "jar:smartquotes.jar!/locale/en-US/"],
);

messenger.WindowListener.registerWindow(
    "chrome://global/content/customizeToolbar.xul", 
    "chrome://smartquotes/content/smartquotes.css",
	"chrome://messenger/content/messengercompose/messengercompose.xul",
	"chrome://smartquotes/content/overlay.xul");


messenger.WindowListener.startListening();

})()