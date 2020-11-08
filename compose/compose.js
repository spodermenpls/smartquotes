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
	
	// DOM iteration functions
	function previousNode(node){
		if (node.previousSibling){
			node = node.previousSibling;
			while (node.lastChild){
				node = node.lastChild;
			}
			return node;
		}
		return node.parentNode;
	}
	function nextNode(node, goDown = true){
		if (goDown && node.firstChild){
			return node.firstChild;
		}
		if (node.nextSibling){
			return node.nextSibling;
		}
		if (node.parentNode){
			return nextNode(node.parentNode, false);
		}
		return null;
	}
	function iterateNodeUntil(node, iterate, check){
		let checkNode = node;
		while (checkNode && !check(checkNode)){
			node = checkNode;
			checkNode = iterate(node);
		}
		return checkNode || node;
	}
	
	const lineBreakNodeNames = ["BR", "BODY"];
	const lineBreakDisplays = [
		"block", "flow-root", "table", "flex", "grid", "list-item",
		"table-row-group", "table-header-group", "table-footer-group", "table-row", "table-cell", "table-caption"
	];
	function isLineBreakNode(node){
		if (node.nodeType !== 1){
			return false;
		}
		if (lineBreakNodeNames.indexOf(node.nodeName) !== -1){
			return true;
		}
		return lineBreakDisplays.indexOf(window.getComputedStyle(node).display) !== -1;
	}
	
	function getLineBeforeSelection(){
		const selection = document.getSelection();
		const range = selection.getRangeAt(0).cloneRange();
		range.collapse(true);
		const endNode = range.endContainer;
		const startNode = iterateNodeUntil(
			endNode.nodeType === 3? endNode: (endNode.childNodes[range.endOffset - 1] || endNode),
			previousNode,
			isLineBreakNode
		);
		if (
			startNode === endNode ||
			(startNode.compareDocumentPosition(endNode) & Node.DOCUMENT_POSITION_CONTAINED_BY)
		){
			range.setStartBefore(startNode);
		}
		else {
			range.setStartAfter(startNode);
		}
		return range.toString();
	}
	function getLineAfterSelection(){
		const selection = document.getSelection();
		const range = selection.getRangeAt(0).cloneRange();
		range.collapse(false);
		const startNode = range.startContainer;
		const endNode = iterateNodeUntil(
			startNode.nodeType === 3? startNode: (startNode.childNodes[range.startOffset] || startNode),
			nextNode,
			isLineBreakNode
		);
		if (startNode === endNode){
			range.setEndAfter(endNode);
		}
		else {
			range.setEndBefore(endNode);
		}
		return range.toString();
	}
	
	const body = window.document.querySelector("html");
	body.addEventListener("keydown", function(event){
		if (smartQuoteActive && !event.ctrlKey){
			const context = {
				get previous(){
					return getLineBeforeSelection();
				},
				get next(){
					return getLineAfterSelection();
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
		const context = {
			previous: "",
			next: selection.toString()
		};
		
		// select first character
		selection.collapseToStart();
		selection.modify("extend", "forward", "character");
		
		while (context.next){
			let key = selection.toString();
			
			// selection does not return a string (e.g. a line break may be selected)
			if (!key){
				let lastFocusOffset = selection.focusOffset;
				while (!key){
					// move selection to next character
					selection.collapseToEnd();
					selection.modify("extend", "forward", "character");
					key = selection.toString();
					if (lastFocusOffset === selection.focusOffset){
						// selection did not change - end of document reached
						break;
					}
					lastFocusOffset = selection.focusOffset;
				}
				if (!key){
					// not able to find any key - end of document reached
					break;
				}
			}
			
			const keyIndex = context.next.indexOf(key);
			if (keyIndex === -1){
				// selection went out of its boundaries
				break;
			}
			if (keyIndex){
				// some characters (hopefully white spaces...) did not get selected
				context.previous += context.next.substr(0, keyIndex);
			}
			context.next = context.next.substr(keyIndex + key.length);
			
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
			
			// move selection to next character
			selection.collapseToEnd();
			selection.modify("extend", "forward", "character");
			context.previous += inserted;
		}
		
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
