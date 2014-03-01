# Project 8 - Infinite Scrolling with jQuery

### Notes
- Lots of opportunities for chaining functions
- Lots of opportunities to declare variables in one place
- p.194: `<imgsrc="..." />` in book when should be `<img src="..." />`. Duh.
- p.195: `{{>~Truncate(12,description)}}` in book, `{{>~Truncate(description)}}` in sample code
	- `truncate()` helper different between book and sample
	- Function defined with 2 arguments, inclined to believe book
- p.199: `orderby: "published"` option of `getData()` in sample code, not in book

### Problems
- Error: Uncaught TypeError: undefined is not a function on imagesloaded.js on line 125
	- Something changed in the imagesloaded.js after publication. Don't use GitHub version, use version included in book files
- Error: Uncaught TypeError: Cannot read property 'items' of undefined in script.js on line 27
	- Scrolling too fast! Images haven't yet loaded, script is freaking out

### Dependencies
- jQuery
- jsrender
- imagesLoaded

### Status
Complete