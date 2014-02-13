// Wait for Chrome extension's connect event to fire
chrome.extension.onConnect.addListener(function(port) {
	// Port opened
	// Add event handler for message events
	port.onMessage.addListener(function(msg) {
		// Is 'getData' the command sent through the message port?
		if (msg.command === 'getData') {
			// Contacts pull from localStorage or no contacts found
			var contacts = localStorage.getItem('webContacts') || '{"message": "no contacts"}',
				jsonContacts = JSON.parse(contacts);

			// Pass back to the port
			port.postMessage(jsonContacts);
		}
		// Is 'setData' the commmand sent through the message port?
		else if (msg.command === 'setData') {
			// Store one or more contacts to localStorage
			localStorage.setItem(
				'webContacts',
				JSON.stringify({
					contacts: msg.contacts
				})
			);

			// Confirm data saved
			port.postMessage({
				message: 'success'
			});
		}
	});
});