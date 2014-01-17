(function($) {
	var win = $(window),
		page = $('body'),
		wrapper = page.find('div.wrapper'),
		article = page.find('article'),
		fixedEl = page.find('aside'),
		sections = page.find('section'),
		initialPos = fixedEl.offset(),
		width = fixedEl.width(),
		percentWidth = 100 * width / wrapper.width();

		// Check to see if hash is in URL
		if (document.location.hash) {
			var href = document.location.hash,
				target = parseInt(href.split('#part')[1]),
				targetOffset = sections.eq(target - 1).offset().top;	
		
			page.scrollTop(0);
			document.location.hash = '';
			scrollPage(href, targetOffset, true);
		}

		// Initialize the fixed styling when scroll first deteceted
		win.one('scroll', function() {
			// Set initial styles
			fixedEl.css({
				width: width,
				position: 'fixed',
				top: Math.round(initialPos.top),
				left: Math.round(initialPos.left)
			});
		});

		// Listen for window resizing
		win.on('resize', function() {
			if (fixedEl.css('position') === 'fixed') {
				var wrapperPos = wrapper.offset().left,
					wrapperWidth = wrapper.width(),
					fixedWidth = (wrapperWidth / 100) * percentWidth;

				// Reset the styles
				fixedEl.css({
					width: fixedWidth,
					left: wrapperPos + wrapperWidth - fixedWidth,
					top: article.offset().top
				});
			}
		});

		// Scroll to the clicked anchor
		function scrollPage(href, scrollAmount, updateHash) {
			if (page.scrollTop() !== scrollAmount) {
				page.animate({
					scrollTop: scrollAmount
				}, 500, function() {
					// Update the URL to include the new hash
					if (updateHash) {
						document.location.hash = href;
					}
				});
			}
		}

		// Listen for <aside> link clicks
		page.on('click', 'aside a', function(e) {
			e.preventDefault();

			var href = $(this).attr('href'),
				target = parseInt(href.split('#part')[1]),
				targetOffset = sections.eq(target - 1). offset().top;

			// Take me there!
			scrollPage(href, targetOffset, true);
		});

		// Enable back button functionality
		win.on('hashchange', function() {
			var href = document.location.hash,
				target = parseInt(href.split('#part')[1]),
				targetOffset = (!href) ? 0 : sections.eq(target - 1).offset().top;

			// Let's go	
			scrollPage(href, targetOffset, false);
		});
})(jQuery);