async function main() {
	// Get the current open tabs, we assume the popup was opened
	// in the current active window and tab.
	let tabs = await messenger.tabs.query({
	  active: true,
	  currentWindow: true,
	});

	// Double check, that we got at least one tab.
	if (tabs.length == 0) {
		// We should probably render an error msg in the popup.
		return;
	}

	console.log(tabs);
	// tabs[0].id is the id of the tab of the composer window
	let tabId = tabs[0].id;
	
	// Instead of sending a message to the background script via 
	// messenger.runtime.sendMessage,  we can send a message to
	// the compose tab using messenger.tabs.sendMessage and we
	// can even process the answer.
	messenger.tabs.sendMessage(tabId, {msg: "getConnected"})
		.then((answer) => {
			console.log(`The compose script in tab <${tabId}> answered <${answer}>`)
		});
}

main();