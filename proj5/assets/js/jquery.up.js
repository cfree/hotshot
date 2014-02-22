/** 
 * Name: jQuery File Uploader widget
 * Version: 1.0
 */
;(function($) {
	// Overrideable defaults
	var defaults = {
		strings: {
			title: 'Up - A jQuery uploader',
			dropText: 'Drag files here',
			altText: 'Or select using the button',
			buttons: {
				choose: 'Choose files',
				upload: 'Upload files'
			},
			tableHeadings: [
				'Type', 'Name', 'Size', 'Remove all x'
			]
		}
	};

	// Constructor
	function Up(el, opts) {
		this.config = $.extend(true, {}, defaults, opts);
		this.el = el;
		this.fileList = [];
		this.allXHR = [];
	}

	// Prototype
	Up.prototype.init = function() {
		var widget = this, // refers to the jQuery collection of elements
			strings = widget.config.strings, // locally scope strings property
			// create HTML elements in memory
			container = $('<article/>', {
				'class': 'up'
			}),
			heading = $('<h1/>', {
				text: strings.title
			}).appendTo(heading),
			drop = $('<div/>', {
				class: 'up-drop-target',
				html: $('<h2/>', {
					text: strings.dropText
				})
			}).appendTo(container),
			alt = $('<h3/>', {
				text: strings.altText
			}).appendTo(container),
			upload = $('<input/>', {
				type: 'file'
			}).prop('multiple', true).appendTo(container), // Multiple files in supporting browsers
			select = $('<a/>', {
				href: '#',
				'class': 'button up-choose',
				text: strings.buttons.choose
			}).appendTo(container),
			selected = $('<div/>', {
				'class': 'up-selected'
			}).appendTo(container),
			upload = $('<a/>', {
				href: '#',
				'class': 'button up-upload',
				text: strings.buttons.upload
			}).appendTo(container);

		// Simulate file input initiation when link is clicked
		widget.el.on('click', 'a.up-choose', function(e) {
			e.preventDefault();
			widget.el.find('input[type="file"]').click();
		});

		widget.el.on('drop change dragover', 'article.up', function(e) {
			if (e.type === 'dragover') {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
			else if (e.type === 'drop') {
				e.preventDefault();
				e.stopPropagation();
				// Get all the files
				widget.files = e.originalEvent.dataTransfer.files;
			}
			else {
				// Get all the files
				widget.files = widget.el
					.find('input[type="file"]')[0]
					.files;
			}

			widget.handleFiles();
		});

		// Handle 'remove' and 'remove all' links
		widget.el.on('click', 'td a', function(e) {
			var removeAll = function() {
				widget.el.find('table').remove(); // remove table from widget
				widget.el.find('input[type="file"]').val(''); // clear the input value
				widget.fileList = []; // clear the fileList array
			};

			// Has 'remove all' been clicked?
			if (e.originalEvent.target.className == 'up-remove-all') {
				removeAll();
			}
			else {
				var link = $(this),
					removed,
					filename = link.closest('tr').children().eq(1).text();

				// Remove the desired row
				link.closest('tr').remove();

				// In the fileList, compare each item's name property to the filename variable
				$.each(widget.fileList, function(i, item) {
					// Do they match?
					if (item.name === filename) {
						removed = i;
					}
				});

				// Remove the file the current row represented
				widget.fileList.splice(removed, 1);

				// Is the header row the only one left?
				if (widget.el.find('tr').length === 1) {
					removeAll();
				}
			}
		});

		widget.el.on('click', 'a.up-upload', function(e) {
			e.preventDefault();

			widget.uploadFiles();
		});

		// Add all HTML elements to the container at once
		widget.el.append(container);
	};

	// Display the list of selected files
	Up.prototype.handleFiles = function() {
		var widget = this,
			container = widget.el.find('div.up-selected'),
			row = $('<tr/>'),
			cell = $('<td/>'),
			remove = $('<a/>', {
				href: '#'
			}),
			table;

		// Create a table if there isn't one already	
		if (!container.find('table').length) {
			table = $('<table/>');

			var header = row.clone().appendTo(table),
				strings = widget.config.strings.tableHeadings;

			$.each(strings, function(i, string) {
				var cs = string.toLowerCase().replace(/\s/g, '_'),
					newCell = cell.clone().addClass('up-table-head ' + cs).appendTo(header);

				if (i === strings.length - 1) {
					var clear = remove.clone().text(string).addClass('up-remove-all');

					newCell.html(clear).attr('colspan', 2);
				}
				else {
					newCell.text(string);
				}
			});
		}
		else {
			table = container.find('table');
		}

		// Create table rows
		$.each(widget.files, function(i, file) {
			var fileRow = row.clone(),
				filename = file.name.split('.'),
				ext = filename[filename.length - 1],
				del = remove.clone().text('x').addClass('up-remove');

			cell.clone().addClass('icon ' + ext).appendTo(fileRow);
			cell.clone().text(file.name).appendTo(fileRow);
			cell.clone().text((Math.round(file.size / 1024)) + 'kb').appendTo(fileRow);
			cell.clone().html(del).appendTo(fileRow);
			cell.clone().html('<div class="up-progress" />').appendTo(fileRow);

			// Add row to table
			fileRow.appendTo(table);

			// Add current file to fileList array to be uploaded
			widget.fileList.push(file);
		});

		// Does a table in memory exist already?
		if (!container.find('table').length) {
			table.appendTo(container);
		}

		// Add a progress indicator
		widget.initProgress();
	};

	// Display the progress bar
	Up.prototype.initProgress = function() {
		// Get all files to be uploaded
		this.el.find('div.up-progress').each(function() {
			var el = $(this);

			if (!el.hasClass('ui-progressbar')) {
				el.progressbar();
			}
		});
	};

	// Visually show percentage of progress
	Up.prototype.handleProgress = function() {
		var complete = Math.round((e.loaded / e.total) * 100);

		progress.progressbar('value', complete);
	};

	// Handle the file upload
	Up.prototype.uploadFiles = function() {
		var widget = this,
			a = widget.el.find('a.up-upload');

		// Are there no uploads currently in progress?
		if (!a.hasClass('disabled')) {
			a.addClass('disabled');

			// Cycle through the list of files
			$.each(widget.fileList, function(i, file) {
				var fd = new FormData(),
					prog = widget.el.find('div.up-progress').eq(i); // associate progress bar with file

				fd.append('file-' + i, file);

				// Post form data to server
				widget.allXHR.push(
					$.ajax({
						type: 'POST',
						url: '/upload.asmx/uploadFile',
						data: fd,
						contentType: false,
						processData: false,
						xhr: function() {
							// Store jQuery version of XHR response
							var xhr = jQuery.ajaxSettings.xhr();

							// Update the progress bar
							if (xhr.upload) {
								xhr.upload.onprogress = function(e) {
									widget.handleProgress(e, prog);
								};
							}

							return xhr;
						}
					})
					.done(function() {
						// Advise of status upon completion
						var parent = prog.parent(),
							prev = parent.prev();

						prev.add(parent).empty();
						prev.text('File uploaded!');
					});
				);
			});
		}
	};

	// Extend jQuery to include plugin
	$.fn.up = function(options) {
		new Up(this, options).init();
		
		// Important for chaining
		return this;
	};
})(jQuery);