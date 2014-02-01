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

	Up.prototype.init = function() {
		var widget = this,
			strings = widget.config.strings,
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
			}).prop('multiple', true).appendTo(container),
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

		widget.el.append(container);
	}

	// Extend jQuery to include plugin
	$.fn.up = function(options) {
		new Up(this, options).init();
		
		// Important for chaining
		return this;
	};
})(jQuery);