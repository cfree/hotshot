(function() {
	$.views.helpers({
		// Call for each object in the contactMethods() object
		getMembers: function(obj) {
			var prop, 
				arr = [];

			// Iterate through the object argument
			for (prop in obj) {
				// Check the property being iterated belongs to the object
				// passed in and not inherited from the prototype
				if (obj.hasOwnProperty(prop)) {
					var newObj = {
						key: prop,
						val: obj[prop]
					};

					// Return to the template
					arr.push(newObj);
				}
			}

			return arr;
		}
	});

	// Cache template
	var template = $.templates($('#contactTemplate').html());

	// Subscribe to message events
	window.addEventListener('message', function(e) {
		// Message contents is `issueTemplate`?
		if (e.data.command === 'issueTemplate') {
			// Compose new message containing rendered markup
			var message = {
				markup: template.render(e.data.context)
			};

			// Sent message back to popup.js (source)
			// Same types of files (origin)
			e.source.postMessage(message, e.origin);
		}
	});
})();