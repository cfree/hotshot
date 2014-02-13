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
})();