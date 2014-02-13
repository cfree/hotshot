var iframe = $('#poster'),
	message = {
		command: 'issueTemplate',
		context: JSON.parse(localStorage.getItem('webContacts'))
	};

iframe.on('load', function() {
	// Context property set?
	if (message.context) {
		// Post the message to the iframe
		// postMessage() takes two parameters:
		// 1. what to post
		// 2. which type of file can receive the message
		iframe[0].contentWindow.postMessage(message, '*');
	}
	else {
		// Create new message advising that no contacts have
		// been added yet. Add message to popup
		$('<li/>', {
			text: 'No contacts added yet'
		}).appendTo($('#contacts'));
	}
});

// Handle incoming markup
window.addEventListener('message', function(e) {
	$('#contacts').append(e.data.markup);
});