/*	tbSmartQuotes
	============================================================

	Mark Simon
	http://smartquotes.info

	Thunderbird Extension Development:

		//	https://developer.mozilla.org/en-US/docs/Web/API/Selection
		//	https://developer.mozilla.org/en-US/docs/Extensions/Thunderbird/HowTos
		//	http://mdn.beonex.com/en/Extensions/Thunderbird/HowTos/Common_Thunderbird_Use_Cases/Compose_New_Message.html

		//	https://developer.mozilla.org/en/docs/Submitting_an_add-on_to_AMO
		//	https://developer.mozilla.org/en-US/docs/Extensions/Thunderbird/Building_a_Thunderbird_extension_2:_extension_filesystem
		//	https://developer.mozilla.org/en-US/docs/Extensions/Thunderbird/Creating_a_Custom_Column

	============================================================ */

/*	Feed Back
	============================================================ */

	function say(message) {
		alert(message);
	}


/*	insertChar()
	============================================================ */
	function insertChar(editor,char) {
		editor.beginTransaction();
		editor.insertText(char);
		editor.endTransaction();
	}
/*	Smart Quotes
	============================================================ */

//	var theWindow = document.commandDispatcher.focusedWindow;
//	theWindow.addEventListener('keypress',handleQuotes);

	var button;
	window.addEventListener("load", function() {
		button=document.getElementById('smartQuotesAuto');
		button.state=1;
		window.addEventListener("keypress", handleQuotes, false);
	}, false);



	function smartQuotes(text) {
		text=text.replace(/(^|\B)(')\b/g,'‘');
		text=text.replace(/(^|\B)(")\b/g,'“');
		text=text.replace(/'/g,'’');
		text=text.replace(/"/g,'”');
		return text;
	}


/*	Handle Quote Character: attach to element.onkeypress
	------------------------------------------------------------ */
	//alert(range);
	//alert(range.startOffset);
	//alert(document.commandDispatcher.focusedWindow==window);	//	false implies compose window which is good


	function handleQuotes(e) {
		//	var target=e.target;
		if(!button.state) return;
		var code=e.charCode;
		if(code==34||code==39) {
			var editor = GetCurrentEditor();
			if(e.ctrlKey) {		//	ctrl->allow straight quotes
				insertChar(editor,e.shiftKey?'"':"'");
				return false;
			}
			var char;
			var selection = document.commandDispatcher.focusedWindow.getSelection();
			var text = editor.outputToString('text/plain', 8);
			var range=selection.getRangeAt(0);
			var l=range.startOffset;
			var before = text.substr(l-1,1);

			if(code==34) char=before.match(/\B/)?'“':'”';
			else char=before.match(/\B/)?'‘':'’';
//alert(char);
			insertChar(editor,char);
			e.preventDefault();
			return false;
		}
		else return true;
	}

		function doSmartQuotesAuto() {
			if(button.state) {
				button.image="chrome://smartquotes/content/images/sq0.png";
				button.state=0;
			}
			else {
				button.image="chrome://smartquotes/content/images/sq1.png";
				button.state=1;
			}
		}

/*	Doit
	============================================================ */
		function doSmartQuotesConvert() {
//			var editor = gMsgCompose.editor;
//			editor = editor.QueryInterface(Components.interfaces.nsIHTMLEditor);

			var editor = GetCurrentEditor();

			var selection = document.commandDispatcher.focusedWindow.getSelection();
			var text = selection.toString();
			text=smartQuotes(text);

			editor.beginTransaction();
			editor.insertText(text);
			editor.endTransaction();
		}
