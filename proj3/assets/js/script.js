(function($) {
	$(document).ready(function() {
		var api = google.maps,
			mapCenter = new api.LatLng(50.91710, -1.40419),
			mapOptions = {
				zoom: 13,
				center: mapCenter,
				mapTypeId: api.MapTypeId.ROADMAP,
				disableDefaultUI: true
			},
			map = new api.Map(document.getElementById('map'), mapOptions),
			ui = $('#ui'),
			clicks = 0,
			positions = [],
			assetsPath = '/common/img/';

		// Create a new marker for the starting point
		var homeMarker = new api.Marker({
			position: mapCenter,
			map: map,
			icon: assetsPath + 'hq.png'
		});

		// Create new info window for the starting point
		var infoWindow = new api.InfoWindow({
			content: document.getElementById('hqInfo')
		});

		// Show info window when starting point marker clicked
		api.event.addListener(homeMarker, 'click', function() {
			infoWindow.open(map, homeMarker);
		});

		// Add a marker to the page
		var addMarker = function(e) {
			if (clicks <= 1) {
				// Add current position to positions array
				positions.push(e.latLng);

				// Create new marker object
				var marker = new api.Marker({
					map: map,
					position: e.latLng,
					flat: (clicks === 0) ? true : false,
					animation: api.Animation.DROP,
					title: (clicks === 0) ? 'Start' : 'End',
					icon: (clicks === 0) ? assetsPath + 'start.png' : '',
					draggable: true,
					id: (clicks === 0) ? 'Start' : 'End'
				});

				// Listen for 'dragend' on marker object, assign to 'markerDrag' handler function
				api.event.addListener(marker, 'dragend', markerDrag);

				// Trigger custom 'locationAdd' event
				api.event.trigger(map, 'locationAdd', e);
			}
			else {
				// Remove listener after 2 clicks
				api.event.removeListener(mapClick);
				return false;
			}
		};

		// Assign the addMarker function to the click event on the map
		var mapClick = api.event.addListener(map, 'click', addMarker);

		// 'locationAdd' event handler
		api.event.addListener(map, 'locationAdd', function(e) {
			var journeyEl = $('#journey'), // Cache a jQuery object in a variable, unknown if object exists or not
				outer = (journeyEl.length) ? journeyEl : $('<div>', {
					id: "journey"
				}); // Assign outer to the jQuery object if it already exists. If not, create it

			// Get the address of the coordinates
			new api.Geocoder().geocode({
				'latLng': e.latLng
			}, function(results) {
				// Create a new heading, add to the 'outer' element
				$('<h3/>', {
					text: (clicks === 0) ? 'Start:' : 'End:'
				}).appendTo(outer);

				// Create a new paragraph, add to the 'outer' element
				$('<p/>', {
					text: results[0].formatted_address, // result of the reverse geocode
					id: (clicks === 0) ? 'StartPoint' : 'EndPoint',
					'data-latLng': e.latLng
				}).appendTo(outer);

				// Is this the first marker added? (does #journey exist on the page?)
				if (!journeyEl.length) {
					// Add the 'outer' (#journey) element to the #ui element
					outer.appendTo(ui);
				}
				else {
					// #journey has been added already
					// Create and add a button to the existing #journey element
					$('<button/>', {
						id: 'getQuote',
						text: 'Get quote'
					})
					.prop('disabled', true)
					.appendTo(journeyEl);
				}

				// Keep track of the number of markers added
				clicks++;
			});
		});

		// When a marker gets dragged...
		var markerDrag = function(e) {
			var elId = ['#', this.get('id'), 'Point'].join('');

			// Do reverse geocoding again, assign address to text of dragged pin
			new api.Geocoder().geocode({
				'latLng': e.latLng
			}, function(results) {
				$(elId).text(results[0].formatted_address);
			});
		};

		// Once a weight is entered, make the button clickable
		$('#weight').on('keyup', function() {
			// Throttle the key recognition to fire less frequently
			if (timeout) {
				clearTimeout(timeout);
			}

			var field = $(this),
				enableButton = function() {
					// Determine if input has a value
					if (field.val()) {
						// Allow use of the button
						$('#getQuote').removeProp('disabled');
					}
					else {
						// Disable the button
						$('#getQuote').prop('disabled', true);
					}
				},
				timeout = setTimeout(enableButton, 250);
		});

		// Remove the button if clicked
		$('body').on('click', '#getQuote', function(e) {
			e.preventDefault();
			$(this).remove();

			// Compute the distance between two points
			new api.DistanceMatrixService().getDistanceMatrix({
				origins: [$('#StartPoint').attr('data-latLng')],
				destinations: [$('#EndPoint').attr('data-latLng')],
				travelMode: google.maps.TravelMode.DRIVING,
				unitSystem: google.maps.UnitSystem.IMPERIAL
			}, function(response) {
				// Variables, computations
				var list = $('<dl/>', {
						'class': 'clearfix',
						id: 'quote'
					}),
					format = function(number) {
						var rounded = Math.round(number * 100) / 100,
							fixed = rounded.toFixed(2);

						return fixed; // dollar form
					},
					term = $('<dt/>'),
					desc = $('<dd/>'),
					distance = response.rows[0].elements[0].distance,
					weight = $('#weight').val(),
					distanceString = distance.text + 'les',
					distanceNum = parseFloat(distance.text.split(' ')[0]),
					distanceCost = format(distanceNum * 3),
					weightCost = format(distanceNum * 0.25 * distanceNum),
					totalCost = format(+distanceCost + +weightCost);

				// Add heading
				$('<h3/>', {
					text: 'Your quote',
					id: 'quoteHeading'
				}).appendTo(ui);

				// Add computed results to list
				term.clone().html('Distance:').appendTo(list);
				desc.clone().text(distanceString).appendTo(list);
				term.clone().text('Distance cost:').appendTo(list);
				desc.clone().text('$' + distanceCost).appendTo(list);
				term.clone().text('Weight cost:').appendTo(list);
				desc.clone().text('$' + weightCost).appendTo(list);
				term.clone().addClass('total').text('Total:').appendTo(list);
				desc.clone().addClass('total').text('$' + totalCost).appendTo(list);
				
				// Show list
				list.appendTo(ui);
			});
		});
	});
})(jQuery);




