// Registering a command listener to open the popup via shortcuts
messenger.commands.onCommand.addListener(commandListener);

console.log("Registering composeScripts");
messenger.composeScripts.register({
	css: [],
	js: [
		{file: "compose/rules.js"},
		{file: "compose/compose.js"}
	]
});

async function commandListener(cmd) {
	switch (cmd) {
		case "open_compose_action_popup":
			console.log("opening popup");
			messenger.composeAction.openPopup();
			break;
		case "toggle_smart_quote":
			console.log("toggle smart quote");
			messenger.storage.local.set({
				smartQuoteActive: !(await messenger.storage.local.get({smartQuoteActive: true})).smartQuoteActive
			});
			ports.forEach(function(port){
				port.postMessage({command: "toggleSmartQuoteActive"});
			});
			break;
	}	
}

// collect ports to composer scripts to be able to talk to them
const ports = [];
messenger.runtime.onConnect.addListener(function(port){
	ports.push(port);
	port.onDisconnect.addListener(function(){
		const index = ports.indexOf(port);
		if (index !== -1){
			ports.splice(index, 1);
		}
	});
	port.onMessage.addListener(function(message){
		console.log(port, message);
		switch (message.command){
			case "updateIcon":
				messenger.composeAction.setIcon({
					tabId: port.sender.tab.id,
					path: message.smartQuoteActive? "images/iconActive.svg": "images/iconInactive.svg"
				});
				break;
		}
	});
});

messenger.runtime.onMessage.addListener(function(message, sender, sendResponse){
	switch (message.command){
		case "proxyToTab":
			ports.forEach(function(port){
				if (port.sender.tab.id === message.tabId){
					console.log("proxy to tab", message);
					message.message.id = Math.random();
					port.onMessage.addListener(function listener(answer){
						console.log("tab answered", answer);
						if (answer.id === message.message.id){
							port.onMessage.removeListener(listener);
							delete answer.id;
							sendResponse(answer);
						}
					});
					port.postMessage(message.message);
				}
			});
			return true;
	}
});