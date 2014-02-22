(function($) {

	var data = {}, // container for AJAX request results
		startIndex = 1, // index number of first video desired
		listHeight = 0,
		win = $(window),
		winHeight = win.height(),
		// Get profile data of owner of the feed
		getUser = function() {
			return $.getJSON('http://gdata.youtube.com/feeds/api/users/tedtalksdirector?callback=?', {
				v: 2,
				alt: 'json',
			}, function(user) {
				// Add contents of user info received to our data obj
				data.userdata = user.entry;
			});
		},
		// Get video data from the feed
		getData = function() {
			return $.getJSON('https://gdata.youtube.com/feeds/api/videos?callback=?', {
				v: 2,
				alt: 'jsonc', // slightly more efficient than regular JSON
				'start-index': startIndex,
				orderby: "published"
			}, function(videos) {
				// Add the contents of the video data to the videodata property of our data obj
				data.videodata = videos.data.items;
			});
		},
		// Helper functions for the templates
		// Create the summary excerpt
		truncate = function(start, summary) {
			return summary.substring(start, 200) + '...';
		},
		// Display time nicely
		formatTime = function(time) {
			var timeArr = [],
				hours = Math.floor(time / 3600),
				mins = Math.floor((time % 3600) / 60),
				secs = Math.floor(time % 60);

			// Format hours
			if (hours > 0) {
				timeArr.push(hours);
			}

			// Format minutes
			if (mins < 10) {
				timeArr.push('0' + mins);
			}
			else {
				timeArr.push(mins);
			}

			// Format seconds
			if (secs < 10) {
				timeArr.push('0' + secs);
			}
			else {
				timeArr.push(secs);
			}

			// Create and return reformatted time string
			return timeArr.join(':');
		},
		// Render our template
		renderer = function(renderOuter) {
			var vidList = $('#videoList');

			// Render both outer _and_ videos?
			if (renderOuter) {
				// Render outer too, please
				vidList.append(
					$('#containerTemplate').render(data.userdata)
				);
			}

			// Render videos
			vidList.find('#videos')
				.append(
					$('#videoTemplate').render(data.videodata)
				)
				// Update the listHeight info
				.imagesLoaded(function() {
					listHeight = $('#videoList').height();
				});
		};

	// Register the template helpers
	$.views.helpers({
		Truncate: truncate,
		FormatTime: formatTime
	});

	// .when() initializes both of the requests
	// .done() handles the callback when the jqXHR objects of the requests have completed
	// Preferred way of handling asynchronous data in jQuery since v1.5
	$.when(getUser(), getData()).done(function() {
		// Paginate: Increment the index by 25 for 'next' page
		startIndex += 25;

		var ud = data.userdata,
			clean = {};

		// Save only the data we want: name, avatar, summary
		clean.name = ud.yt$username.display;
		clean.avatar = ud.media$thumbnail.url;
		clean.summary = ud.summary.$t;
		// Replace all the user data with just the data we want
		data.userdata = clean;

		// Display outer, show videos 
		renderer(true);
	});

	// Window events
	win.on('scroll', function() {
			// Scrolled to the bottom?
			if (win.scrollTop() + winHeight >= listHeight) {
				// Show loading spinner, message
				$('<li/>', {
					'class': 'loading',
					html: '<span>Loading older videos...</span>'
				}).appendTo('#videos');

				// Get the next 25 videos
				$.when(getData()).done(function() {
					// Increment next set of videos by 25 again (for next time)
					startIndex += 25;

					// Outer already displayed, just show more videos
					renderer();

					// Hide loading spinner
					$('li.loading').remove();
				});
			}
		})
		.on('resize', function() {
			// Recalculate the window height
			winHeight = win.height();
		});

})(jQuery);