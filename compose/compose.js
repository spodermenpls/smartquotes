async function main(){
	"use strict";
	let smartQuoteActive = true;
	// set quote rule according to language
	let quoteRuleName = messenger.i18n.getMessage("quoteRule");
	let quoteRule = quoteRules.get(quoteRuleName);
	
	// set up message handling
	const port = messenger.runtime.connect();
	port.onMessage.addListener(function(message){
		const answer = handleMessage(message);
		
		if (message.id){
			answer.id = message.id;
			port.postMessage(answer);
		}
	});
	
	messenger.runtime.onMessage.addListener(function popupListener(message, sender, sendResponse) {
		sendResponse(handleMessage(message));
	});
	
	function switchQuoteRule(newQuoteRuleName){
		const newQuoteRule = quoteRules.get(newQuoteRuleName);
		if (newQuoteRule){
			quoteRule = newQuoteRule;
			quoteRuleName = newQuoteRuleName;
		}
	}
	
	function setSmartQuoteActive(newActive){
		smartQuoteActive = !!newActive;
		port.postMessage({command: "updateIcon", smartQuoteActive});
	}
	// set smartQuoteActive according to current setting
	setSmartQuoteActive((await messenger.storage.local.get({smartQuoteActive})).smartQuoteActive);
	
	const body = window.document.querySelector("html");
	body.addEventListener("keydown", function(event){
		if (smartQuoteActive && !event.ctrlKey){
			const context = {
				_range: false,
				get range(){
					return this._range || (this._range = document.getSelection().getRangeAt(0));
				},
				get previous(){
					const previousRange = this.range.cloneRange();
					previousRange.collapse(true);
					previousRange.setStartBefore(body);
					return previousRange.toString();
				},
				get next(){
					const nextRange = this.range.cloneRange();
					nextRange.collapse(false);
					nextRange.setEndAfter(body);
					return nextRange.toString();
				}
			};
			quoteRule.filter(rule => event.key === rule.key).forEach(function(rule){
				const action = rule.action(context);
				if (action){
					if (rule.preventDefault){
						event.preventDefault();
					}
					document.execCommand("insertText", false, action);
				}
			});
		}
	});
	
	function applyToSelection(){
		const selection = document.getSelection();
		if (!selection.rangeCount){
			return;
		}
		const originalRange = selection.getRangeAt(0);
		selection.collapseToStart();
		selection.modify("extend", "forward", "character");
		const context = {
			previous: "",
			next: originalRange.toString().substr(1)
		};
		originalRange.toString().split("").forEach(function(key){
			let inserted = key;
			quoteRule.filter(rule => key === rule.key).forEach(function(rule){
				const action = rule.action(context);
				if (action){
					if (rule.preventDefault){
						inserted = "";
					}
					document.execCommand("insertText", false, action);
					inserted += action;
				}
			});
			selection.collapseToEnd();
			selection.modify("extend", "forward", "character");
			context.previous += inserted;
			context.next = context.next.substr(1);
		});
		
		// reset selection
		selection.removeAllRanges();
		selection.addRange(originalRange);
	}
	
	// message interface to the background script and the popup script
	function handleMessage(message){
		switch (message.command) {
			case "getConnected":
				return {
					usedQuoteRule: quoteRuleName,
					smartQuoteActive,
				};
			case "switchQuoteRule":
				switchQuoteRule(message.quoteRule);
				return {
					usedQuoteRule: quoteRuleName
				};
			case "setSmartQuoteActive":
				setSmartQuoteActive(message.smartQuoteActive);
				return {
					smartQuoteActive
				};
			case "toggleSmartQuoteActive":
				setSmartQuoteActive(!smartQuoteActive);
				return {
					smartQuoteActive
				};
			case "applyToSelection":
				applyToSelection();
				break;
		}
	}
}

main();
