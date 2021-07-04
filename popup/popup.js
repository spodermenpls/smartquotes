async function main(){
	"use strict";
	
	// keyboard shortcuts
	const shortcuts = {};
	document.addEventListener("keypress", function(event){
		if (shortcuts[event.key]){
			shortcuts[event.key](event);
		}
	});
	
	// Translate all necessary nodes
	document.querySelectorAll(".translate").forEach(function(node){
		node.textContent = messenger.i18n.getMessage(node.textContent) || node.textContent;
	});
	
	// Get the current open tabs, we assume the popup was opened
	// in the current active window and tab.
	const tabs = await messenger.tabs.query({
		active: true,
		currentWindow: true,
	});
	
	// Double check, that we got at least one tab.
	if (tabs.length == 0) {
		// We should probably render an error command in the popup.
		return;
	}
	const tabId = tabs[0].id;
	
	// function to send a message to the composer script
	async function sendToTab(message){
		return messenger.tabs.sendMessage?
			messenger.tabs.sendMessage(tabId, message):
			messenger.runtime.sendMessage({
				command: "proxyToTab",
				tabId,
				message
			});
	}
	
	// get initial information from the composer script
	const tabAnswer = await sendToTab({command: "getConnected"});
	console.log(`The compose script in tab <${tabId}> answered`, tabAnswer);
	
	// apply to selection button
	const applyToSelectionButton = document.getElementById("applyToSelection");
	applyToSelectionButton.addEventListener("click", function(){
		sendToTab({command: "applyToSelection"});
	});
	shortcuts.a = function(){
		applyToSelectionButton.click();
	}
	
	// SmartQuote active checkbox
	const smartQuoteActiveCheckbox = document.getElementById("smartQuoteActive");
	smartQuoteActiveCheckbox.checked = tabAnswer.smartQuoteActive;
	smartQuoteActiveCheckbox.disabled = false;
	smartQuoteActiveCheckbox.addEventListener("change", async function(){
		smartQuoteActiveCheckbox.disabled = true;
		const tabAnswer = await sendToTab({
			command: "setSmartQuoteActive",
			smartQuoteActive: smartQuoteActiveCheckbox.checked
		});
		smartQuoteActiveCheckbox.checked = tabAnswer.smartQuoteActive;
		smartQuoteActiveCheckbox.disabled = false;
	});
	shortcuts.t = function(event){
		smartQuoteActiveCheckbox.checked = !smartQuoteActiveCheckbox.checked;
		smartQuoteActiveCheckbox.dispatchEvent(new Event("change"));
	}
	
	
	// quote rule select
	const quoteRuleSelect = document.getElementById("quoteRule");
	quoteRuleSelect.value = tabAnswer.usedQuoteRule;
	quoteRuleSelect.disabled = false;
	quoteRuleSelect.addEventListener("change", async function(){
		quoteRuleSelect.disabled = true;
		const tabAnswer = await sendToTab({
			command: "switchQuoteRule",
			quoteRule: quoteRuleSelect.value
		});
		quoteRuleSelect.value = tabAnswer.usedQuoteRule;
		quoteRuleSelect.disabled = false;
	});
	Array.from(quoteRuleSelect.options).forEach(function(option, i){
		shortcuts[i + 1] = function(){
			quoteRuleSelect.selectedIndex = i;
			quoteRuleSelect.dispatchEvent(new Event("change"));
		};
	});
	
}

main();