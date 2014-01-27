(function($) {
	var tags = '',
		getBounties = function(page, callback) {
			// AJAX request to Stack Exchange API
			$.ajax({
				url: 'http://api.stackexchange.com/2.0/questions/featured',
				dataType: 'jsonp',
				data: {
					page: page,
					pagesize: 10,
					tagged: tags,
					order: 'desc',
					sort: 'activity',
					site: 'stackoverflow',
					filter: '!)4k2jB7EKv1OvDDyMLKT2zyrACssKmSCXeX5DeyrzmOdRu8sC5L8d7X3ZpseW5o_nLvVAFfUSf'
				},
				beforeSend: function() {
					// Before the data is retrieved...
					// Show the spinner text
					$.mobile.loadingMessageTextVisible = true;
					// Show the spinner
					$.mobile.showPageLoadingMsg('a', 'Searching');
				}
			}).done(function(data) {
				// When finished getting data, send it to the callback handler
				callback(data);
			});
		};

	$(document)
		// Use onpageinit instead of $(document).ready() because the AJAX calls used 
		// throughout jQuery Mobile may not be completed by the time the 
		// document is ready. onpageinit fires only once, when the page is 
		// first fully loaded.
		.on('pageinit', '#welcome', function() {
			// When search button is clicked...
			$('#search').on('click', function() {
				// Prevent the button from being clicked twice
				$(this).closest('.ui-btn').addClass('ui-disabled');

				// Pull in list of tags from the text input
				tags = $('#tags').val();

				// Go get 'em!
				getBounties(1, function(data) {
					// This becomes the AJAX callback function

					// Cache the starting page number
					data.currentPage = 1;

					// Data must be stringified because only arrays and 
					// primitive types can be saved in localStorage.
					// Must convert to a JSON string
					localStorage.setItem('res', JSON.stringify(data));

					// Change the view to the list page
					$.mobile.changePage('list.html', {
						transition: 'slide'
					});
				});
			});
		})
		// Whenever the welcome page is shown...
		.on('pageshow', '#welcome', function() {
			// Re-enable the search button
			$('#search').closest('.ui-btn').removeClass('ui-disabled');
		})
		// Whenever the list page is first loaded...
		.on('pageinit', '#list', function() {
			var data = JSON.parse(localStorage.getItem('res')), // Retrieve the JSON string, parse back into an object
				total = parseInt(data.total, 10), // Total number of results
				size = parseInt(data.page, 10), // Page size data
				totalPages = Math.ceil(total / size),
				months = [
					'Jan',
					'Feb',
					'Mar',
					'Apr',
					'May',
					'Jun',
					'Jul',
					'Aug',
					'Sep',
					'Oct',
					'Nov',
					'Dev'
				],
				// Helper function for template
				createDate = function(date) {
					var cDate = new Date(date * 1000), // UNIX epoch date won't work with JS Date() constructor, so multiply by 1000
						// Concatenate date array into one string
						fDate = [
							cDate.getDate(),
							months[cDate.getMonth()],
							cDate.getFullYear()
						].join(' ');

					return fDate;
				};

			// Make the createDate() function available to the template engine
			$.views.helpers({
				CreateDate: createDate
			});

			// Send the parsed results to the template, render
			$('#results')
				.append(
					$('#listTemplate').render(data)
				)
				.find('ul')
				.listview();

			// Add/remove .ui-disabled class from buttons based on currentPage property (stored on the data obj)
			var setClasses = function() {
				if (data.currentPage > 1) {
					$('a[data-icon="back"]').removeClass('ui-disabled');
				}
				else {
					$('a[data-icon="back"]').addClass('ui-disabled');
				}

				if (data.currentPage < totalPages) {
					$('a[data-icon="forward"]').removeClass('ui-disabled');
				}
				else {
					$('a[data-icon="forward"]').addClass('ui-disabled');
				}
			};

			// Update the headings
			$('span.num').text(data.currentPage);
			$('span.of').text(totalPages);

			// Enable forward buttons if there are pages to display
			if (totalPages > 1) {
				$('a[data-icon="forward"]').removeClass('ui-disabled');
			}

			// Render the template
			$('#results').on('click', 'li', function() {
				var index = $(this).find('a').attr('id').split('-')[1],
					question = data.items[index];

				// Getting the desired ID
				question.pageid = 'item-view-' + index;

				// Rendering the desired question
				//$('#itemTemplate').render(question);
				$('body').append($('#itemTemplate').render(question));

				// // Get the page jQuery object to cache the page
				var page = $('#item-view-' + index);

				// // Delete the cache page reference when the navigating back
				// page.attr('data-external-page', true).on('pageinit', $.mobile._bindPageRemove);

				// // Add the desired animation
				$.mobile.changePage(page, {
					transition: 'slide'
				});
			});
		});
})(jQuery);