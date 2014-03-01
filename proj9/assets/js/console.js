$(function () {

    var doc = $(document),
        input = doc.find("#url"),
        button = doc.find("#load"),
        iframe = doc.find("#page"),
        canvas = document.createElement("canvas");

    //set some AJAX defaults
    $.ajaxSetup({
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        converters: {
            "text json": function (data) {
                var parsed = JSON.parse(data);

                return parsed.d || parsed;
            }
        }
    });

    //handle button clicks
    doc.on("click", "#load", function (e) {
        e.preventDefault();

        var url = input.val(),
            len;
            
        if (url) {
            input.removeClass("empty").data("url", url);
            button.prop("disabled", true);

            //get layouts 
            $.ajax({
                url: "/heat-map.asmx/getLayouts",
                data: JSON.stringify({ url: url }),
            }).done(function (layouts) {

                var option = $("<option/>"),
                    max;

                len = layouts.length;

                function optText(type, i, min, max) {
                    var s,
                        t1 = "layout ";

                    switch (type) {
                        case "normal":
                            s = [t1, i + 1, " (", min, "px - ", max, "px)"];
                            break;
                        case "lastNoMax":
                            s = [t1, len + 1, " (", min, "px)"];
                            break;
                        case "lastWithMax":
                            s = [t1, len + 1, " (", max, "px+)"];
                            break;
                    }

                    return s.join("");
                }

                $.each(layouts, function (i, layout) {
                    
                    //create option for each layout
                    var lMin = layout.min,
                        lMax = layout.max,
                        text = optText("normal", i, lMin, lMax);

                    if (i === len - 1) {
                        if (lMax === "none") {
                            text = optText("lastNoMax", null, lMin, null);
                        } else {
                            max = lMax;
                        }
                    }

                    option.clone().text(text).val(i + 1).appendTo("#layouts");
                });

                //create option for default layout
                if (max) {
                    
                    var fText = optText("lastWithMax", null, null, max);
                    option.clone().text(fText).val(len + 1).prop("selected", true).appendTo("#layouts");
                }
            });

            //load the page in the iframe
            iframe.attr("src", url).load(function () {
                $(this).trigger("iframeloaded", { len: len });
            });

        } else {
            input.addClass("empty");
            button.prop("disabled", false);
        }

    });

    //get click data for page when loaded
    doc.on("iframeloaded", function (e, maxLayouts) {
        
        var url = input.data("url");
        
        //get the data for the page
        $.ajax({
            url: "/heat-map.asmx/getClicks",
            data: JSON.stringify({ url: url, layout: maxLayouts.len + 1 }),
        }).done(function (clicks) {
            
            //height of document in iframe
            var loadedHeight = $("html", iframe[0].contentDocument).outerHeight();

            //set height of section to loaded content
            doc.find("section").height(loadedHeight);
            
            //lay canvas over the iframe
            canvas.width = doc.width();
            canvas.height = loadedHeight;
            $(canvas).appendTo(doc.find("section")).trigger("canvasready", { clicks: clicks });
            
        });

    });

    //draw heat map
    doc.on("canvasready", function (e, clickdata) {
        
        var docWidth = canvas.width,
            docHeight = canvas.height,
            ctx = canvas.getContext("2d") || null;
        
        if (ctx) {

            //set color
            ctx.fillStyle = "rgba(0,0,255,0.5)";
            
            //paint each pixel to the canvas
            $.each(clickdata.clicks, function (i, click) {
            
                var x = Math.ceil(click.x * docWidth / 100),
                    y = Math.ceil(click.y * docHeight / 100);
                
                ctx.beginPath();
                ctx.arc(x, y, 10, 0, (Math.PI/180) * 360, true);
                ctx.closePath();
                ctx.fill();

            });

        }

        //reenable button
        button.prop("disabled", false);

    });

    doc.on("change", "#layouts", function () {

        var url = input.data("url"),
            el = $(this),
            layout = el.val();
        
        $.ajax({
            url: "/heat-map.asmx/getClicks",
            data: JSON.stringify({ url: url, layout: layout }),
        }).done(function (clicks) {

            //cleanse previous canvas
            doc.find("canvas").remove();

            //resize stuff
            var width,
                loadedHeight,
                opt = el.find("option").eq(layout - 1),
                text = opt.text(),
                min = text.split("(")[1].split("px")[0],
                section = doc.find("section"),
                newCanvas = document.createElement("canvas");
            
            if (parseInt(layout, 10) === el.children().length) {
                width = doc.width();
            } else if (parseInt(min, 10) > 0) {
                width = min;             
            } else {
                width = text.split("- ")[1].split("px")[0];
            }

            //set widths
            section.width(width);
            newCanvas.width = width;
            
            //set heights
            loadedHeight = $("html", iframe[0].contentDocument).outerHeight();
            section.height(loadedHeight);
            newCanvas.height = loadedHeight;

            //fix reference to original canvas
            canvas = newCanvas;

            //trigger canvasready event
            $(newCanvas).appendTo(section).trigger("canvasready", { clicks: clicks });

        });
    });

});