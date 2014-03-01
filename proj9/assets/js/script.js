(function($) {
	var doc = $(document),
		// General storage container for session
		clickStats = {
			url: document.location.href,
			clicks: []
		},
		// Store objects representing each layout for the document
		layouts = [];

	// Set AJAX options
	$.ajaxSetup({
		type: 'POST',
		contentType: 'application/json',
		dataType: 'json'
	});

	// Parse any stylesheet attached to document via <link/> elements
	// x = index
	// ss = current stylesheet object
	$.each(doc[0].styleSheets, function(x, ss) {
		// Iterate through rules of stylesheet
		// y = index
		// rule = current rule
		$.each(ss.rules, function(y, rule) {
			// Is this a valid `CSSMediaRule` rule?
			if (rule.media && rule.media.length) {
				// We have a media query!

				var jq = $,
					// store the media query definition
					current = rule.media[0], 
					// store the breakpoints of said media query
					mq = {
						min: (current.indexOf('min') !== -1) ? jq.trim(current.split('min-width:')[1].split('px')[0]) : 0,
						max: (current.indexOf('max') !== -1) ? jq.trim(current.split('max-width:')[1].split('px')[0]) : 'none'
					};

				// Save whatcha got
				layouts.push(mq);
			}
		});
	});

	// Sort in ascending order
	// Makes breakpoint detection much more efficient
	layouts.sort(function(a, b) {
		return a.min - b.min;
	});

	// Send to server so it can be saved
	$.ajax({
		url: 'heat-map.asmx/saveLayouts',
		data: JSON.stringify({
			url: url,
			layouts: layouts
		});
	})
})(jQuery);