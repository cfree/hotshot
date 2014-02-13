(function() {
	var people = $('[itemtype*="schema.org/Person"]'),
		peopleData = [];

	// Determine if there's any micro-data on the page
	if (people.length) {
		// Iterate through each instance
		people.each(function(i) {
			var person = microdata.eq(i),
				data = {},
				contactMethods = {};

			// Visually set the info apart
			person.addClass('app-person');

			// Iterate through each child
			person.children().each(function(j) {
				var child = person.children().eq(j),
					iProp = child.attr('itemprop');

				// Element containing mirodata?
				if (iProp) {
					// Itemscope attribute present?
					if (child.attr('itemscope') !== '') {
						// Is specific itemprop?
						if (iProp === 'email' || iProp === 'telephone') {
							// Use helper method
							contactMethods[iProp] = child.text();
						}
						else {
							// Just use text
							data[iProp] = child.text();
						}
					}
					else {
						// Has itemscope attribute
						var content = [];

						// Push the text content of each grandchild element to `content` array
						child.children().each(function(x) {
							content.push(child.children().eq(x).text());
						});

						// Add current iProp var and content arr to data obj
						data[iProp] = content.join(', ');
					}
				}
			});

			// Obj has it's own proeprties?
			var hasProps = function(obj) {
				var prop,
					hasData = false; // false until proven true

				// Run through each property in the object argument
				for (prop in obj) {
					// Does the property exist (not just inherited)?
					if (obj.hasOwnProperty(prop)) {
						hasData = true;
						break;
					}
				}

				return hasData;
			};

			// Has contactMethods() returned anything?
			if (hasProps(contactMethods)) {
				// Add to data obj
				data.contactMethods = contactMethods;
			}

			// Add data obj to peopleData arr
			peopleData.push(data);

			// Create button to save contact info
			// Will be added to any element containing microdata
			$('<a/>', {
				href: '#',
				'class': 'app-save',
				text: 'Save'
			})
			.on('click', function(e) {
				e.preventDefault();

				var el = $(this),
					port = chrome.extension.connect(), // Open new port
					contacts;

				// Does this link not have `app-saved` class?
				// Prevents duplicate entries for the same person on a single page
				// from being saved in localStorage
				if (!el.hasClass('app-saved')) {
					// Go get previously stored data
					port.postMessage({
						command: 'getData'
					});

					// Handle the message response
					port.onMessage.addListener(function(msg) {
						// No contacts
						if (msg.message === 'no contacts') {
							// Get the person's information for whichever save link was clicked
							contacts = [peopleData[i]];

							// Store this person
							port.postMessage({
								command: 'setData',
								contacts: contacts
							});
						}
						// No message property detected. Is there a contacts property?
						else if (msg.contacts) {
							// Add new contact
							contacts = msg.contacts;
							// Save new contact with old contacts
							contacts.push(peopleData[i]);

							// Store these people
							port.postMessage({
								command: 'setData',
								contacts: contacts
							})
						}
						// Successful save of the contact(s)
						else if (msg.message === 'success') {
							// Set button message, styles
							el.addClass('app-saved').text('Contact information saved');

							// Close the port, we're done here
							port.disconnect();
						}
					});
				}
			})
			.appendTo(person);
		});
	}
})();