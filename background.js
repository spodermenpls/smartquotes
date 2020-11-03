// Registering a command listener to open the popup via shortcuts
messenger.commands.onCommand.addListener(commandListener);

// Registering composeScripts
messenger.composeScripts.register({
  css: [],
  js: [{'file':'compose/compose.js'}]
});





function commandListener(cmd) {
	switch (cmd) {
		case "open_compose_action_popup":
			messenger.composeAction.openPopup();
		break;
	}	
};