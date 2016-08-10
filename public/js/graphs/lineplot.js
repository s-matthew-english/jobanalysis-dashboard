/**
 * Graph Visualization Package
 * Written by Erik Novak <erik.novak@ijs.si>, 2016
 */

/**
 * Creates the lineplot chart object.
 * @param {Lineplot~Options} _options - The options used for the visualization.
 * @example
 * // define the options used for the chart construction
 * var options = {
 *     container:     "#lineplot-container",
 *     identifier:    "identifier",
 *     chartTitle:    "Title",
 *     chartSubtitle: "SubTitle",
 *     margin: {
 *         top:    20,
 *         left:   20,
 *         bottom: 20,
 *         right:  20
 *     }
 * };
 * // create the lineplot chart object
 * var customLineplot = new Lineplot(options);
 */
function Lineplot(_options) {

    /**
     * Options used for the visualization.
     * @typedef {object} Lineplot~Options
     * @property {string} [container=null]   - The container identifier (normaly an html class or id).
     * @property {string} [identifier=null]  - The identifier used for css styling.
     * @property {string} [chartTitle=""]    - The chart title.
     * @property {string} [chartSubtitle=""] - The chart subtitle.
     * @property {object} [margin]           - Margin of the chart content.
     * @property {number} [margin.top=20]    - Top margin.
     * @property {number} [margin.left=20]   - Left margin.
     * @property {number} [margin.bottom=20] - Bottom margin.
     * @property {number} [margin.right=20]  - Right margin.
     */
    var options = $.extend({
        container:     null,
        identifier:    null,
        chartTitle:    "",
        chartSubtitle: "",
        margin:        { top: 20, left: 20, bottom: 20, right: 20 }
    }, _options);

    // class container
    var self = this;

    /**
     * A JSON object containing the dataset info.
     * @typedef {object} Dataset
     * @property {string} [nameX="name"]  - The identifier used for accessing the data used for the x axis.
     * @property {string} [nameY="value"] - The identifier used for accessing the data used for the y axis.
     * @property {object} data - Data storage.
     */
    var dataset = null;

    // initialization flag
    var initialized = false;

    // On point hover callback functions
    var mouseOverPointCallback = null;
    var mouseOutPointCallback  = null;

    // Reusable parameters.
    // Used for manipulating with the SVG objects.
    var svg       = null,
        graphName = null,
        x         = null,
        y         = null,
        x2        = null,
        y2        = null,
        xAxis     = null,
        yAxis     = null,
        x2Axis    = null,
        nameX     = null,
        nameY     = null,
        tip       = null,
        line      = null,
        area      = null,
        focus     = null,
        context   = null;

    /**
     * Sets the options.
     * @param {Lineplot~Options} _options - The options.
     */
    this.setOptions = function (_options) {
        if (typeof (_options) == 'undefined') throw "No options specified";
        options = $.extend(options, _options);
    };

    /**
     * Sets the dataset used for the visualization.
     * @param {Dataset} _dataset - The dataset.
     * @param {boolean} [redrawFlag=true] - If true, it redraws the graph. Otherwise,
     * only sets the dataset.
     */
    this.setDataset = function (_dataset, redrawFlag) {
        if (typeof (_dataset) == 'undefined') throw "No dataset specified";
        redrawFlag = typeof (redrawFlag) === 'undefined' ? true : redrawFlag;
        dataset = _dataset;
        if (redrawFlag) {
            // TODO: write a self.redraw() function
            if (initialized) self.redraw();
            else self.draw();
        }
    };

    /**
     * Sets the on mouseover point callback function.
     * @param {function} func - The function used at the mouseover point.
     * The function must take one parameter, which is the point data.
     * @example
     * //TODO: Must write an example of function's usage.
     */
    this.setMouseOverPointCallback = function (func) {
        if (typeof (func) === 'undefined') throw "No function specified";
        mouseOverPointCallback = func;
    };

    /**
     * Sets the on mouseout point callback function.
     * @param {function} func - The function used at the mouseover point.
     * The function must take one parameter, which is the point data.
     * @example
     * //TODO: Must write an example of function's usage.
     */
    this.setMouseOutPointCallback = function (func) {
        if (typeof (func) === 'undefined') throw "No function specified";
        mouseOutPointCallback = func;
    };

    /**
     * Draws the graph.
     */
    this.draw = function () {
        if (!dataset) throw "Must initialize dataset";

        $(options.container + " svg").remove();
        $(options.container + " .lineplot .d3-tip").remove();

        var totalHeight = $(options.container).height(),
            totalWidth  = $(options.container).width(),
            height      = totalHeight - options.margin.top - options.margin.bottom,
            width       = totalWidth - options.margin.left - options.margin.right;

        nameX = dataset.nameX ? dataset.nameX : "name";
        nameY = dataset.nameY ? dataset.nameY : "value";

        graphName = options.identifier ? "lineplot-" + options.identifier : "";

        x = d3.time.scale().range([0, width]);
        y = d3.scale.linear().range([height, 10]);

        xAxis = d3.svg.axis().scale(x).orient("bottom"),
        yAxis = d3.svg.axis()
                  .scale(y)
                  .ticks(10)
                  .tickSize(-width)
                  .outerTickSize(0)
                  .tickFormat(d3.format("s"))
                  .orient("left");

        x2 = d3.time.scale().range([0, width]);
        y2 = d3.scale.linear().range([50, 0]);

        x2Axis = d3.svg.axis().scale(x2).orient("bottom");

        svg = d3.select(options.container).append("svg")
                .attr("class", "lineplot " + graphName)
                .attr("width", totalWidth)
                .attr("height", totalHeight);

        svg.append("defs").append("clipPath")
           .attr("id", "lineplot-clip")
           .append("rect")
           .attr("id", "rect-clip")
           .attr("width", width)
           .attr("height", height);

        focus = svg.append("g")
                   .attr("class", "focus")
                   .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

        context = svg.append("g")
                     .attr("class", "context")
                     .attr("transform", "translate(" + options.margin.left + "," + (totalHeight - options.margin.bottom + 20) + ")");

        x.domain(d3.extent(dataset.data.map(function (d) { return d[nameX]; })));
        y.domain([0, d3.max(dataset.data.map(function (d) { return d[nameY]; }))]);

        x2.domain(x.domain());
        y2.domain(y.domain());

        svg.append("text")
           .attr("class", "title")
           .attr("x", 10)
           .attr("y", 40)
           .style("font-size", "20px")
           .style("font-family", "sans-serif")
           .style("text-anchor", "start")
           .text(options.chartTitle);

        svg.append("text")
           .attr("class", "subtitle")
           .attr("x", 10)
           .attr("y", 65)
           .style("font-size", "18px")
           .style("font-family", "sans-serif")
           .style("text-anchor", "start")
           .text(options.chartSubtitle);

        //-----------------------
        // Lineplot construction
        //-----------------------

        line = d3.svg.line()
                 .x(function (d) { return x(d[nameX]); })
                 .y(function (d) { return y(d[nameY]); });

        focus.append("path")
             .attr("class", "line")
             .attr("clip-path", "url(#lineplot-clip)")
             .attr("d", line(dataset.data));

        focus.append("g")
             .attr("class", "x axis")
             .attr("transform", "translate(0," + height + ")")
             .call(xAxis);

        var gyAxis = focus.append("g")
                          .attr("class", "y axis")
                          .call(yAxis);

        gyAxis.selectAll("g").filter(function (d) { return d; })
                             .classed("minor", true);

        tip = d3.tip()
                .attr("class", "lineplot " + graphName + " d3-tip")
                .offset([-10, 0])
                .html(function (d) {
                    var htmlText = "<div style='text-align:center;'>" + d[nameX].toDateString() + "</div>";
                    htmlText += "<strong># of jobs:</strong> <span style='color:red'>" + d[nameY] + "</span>";
                    return htmlText;
                });
        svg.call(tip);

        focus.selectAll(".point")
                 .data(dataset.data)
                 .enter().append("circle")
                 .attr("class", "point")
                 .attr("clip-path", "url(#lineplot-clip)")
                 .attr("cx", function (d) { return x(d[nameX]); })
                 .attr("cy", function (d) { return y(d[nameY]); })
                 .attr("r", 3)
                 .on("mouseover", function (d) {
                     if (mouseOverPointCallback) {
                         mouseOverPointCallback(d);
                     }
                     if (tip) {
                         tip.show(d);
                     }
                 })
                 .on("mouseout", function (d) {
                     if (mouseOutPointCallback) {
                         mouseOutPointCallback(d);
                     }
                     if (tip) {
                         tip.hide(d);
                     }
                 });

        //-----------------------
        // Brush construction
        //-----------------------

        var brushMin = dataset.data.length > 100 ? dataset.data.length - 100 : 0;
        var brushMax = dataset.data.length - 1;

        brush = d3.svg.brush()
                  .x(x2)
                  .extent([
                      dataset.data[brushMin][nameX],
                      dataset.data[brushMax][nameX]
                  ])
                  .on("brush", brushed);

        area = d3.svg.area()
                 .interpolate("linear")
                 .x(function (d) {
                     return x2(d[nameX]);
                 })
                 .y0(50)
                 .y1(function (d) {
                     return y2(d[nameY]);
                 });

        context.append("path")
               .datum(dataset.data)
               .attr("class", "area")
               .attr("clip-path", "url(#lineplot-clip)")
               .attr("d", area);

        context.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + 50 + ")")
                .call(x2Axis);

        context.append("g")
               .attr("class", "x brush")
               .call(brush)
               .call(brush.event)
               .selectAll("rect")
               .attr("y", 0)
               .attr("height", 50);

        initialized = true;
    };

    this.redraw = function () {
        var totalHeight = $(options.container).height(),
            totalWidth  = $(options.container).width(),
            height      = totalHeight - options.margin.top - options.margin.bottom,
            width       = totalWidth - options.margin.left - options.margin.right;

        nameX = dataset.nameX ? dataset.nameX : "name";
        nameY = dataset.nameY ? dataset.nameY : "value";

        x.domain(d3.extent(dataset.data.map(function (d) { return d[nameX]; })));
        y.domain([0, d3.max(dataset.data.map(function (d) { return d[nameY]; }))]);

        x2.domain(x.domain());
        y2.domain(y.domain());

        xAxis.scale(x).orient("bottom"),
        yAxis.scale(y)
             .ticks(10)
             .tickSize(-width)
             .outerTickSize(0)
             .tickFormat(d3.format("s"))
             .orient("left");

        x2Axis.scale(x2).orient("bottom");

        line.x(function (d) { return x(d[nameX]); })
            .y(function (d) { return y(d[nameY]); });

        focus.selectAll(".x.axis").call(xAxis);

        var gyAxis = focus.selectAll(".y.axis").call(yAxis);

        gyAxis.selectAll("g").filter(function (d) { return d; })
                             .classed("minor", true);

        focus.selectAll(".line")
             .attr("d", line(dataset.data));

         var points = focus.selectAll(".point")
                           .data(dataset.data);

         points.attr("cx", function (d) { return x(d[nameX]); })
               .attr("cy", function (d) { return y(d[nameY]); });

         points.exit().remove();

         points.enter().append("circle")
               .attr("class", "point")
               .attr("clip-path", "url(#lineplot-clip)")
               .attr("cx", function (d) { return x(d[nameX]); })
               .attr("cy", function (d) { return y(d[nameY]); })
               .attr("r", 3)
               .on("mouseover", function (d) {
                   if (mouseOverPointCallback) {
                       mouseOverPointCallback(d);
                   }
                   if (tip) {
                       tip.show(d);
                   }
               })
               .on("mouseout", function (d) {
                   if (mouseOutPointCallback) {
                       mouseOutPointCallback(d);
                   }
                   if (tip) {
                       tip.hide(d);
                   }
               });

         var brushMin = dataset.data.length > 100 ? dataset.data.length - 100 : 0;
         var brushMax = dataset.data.length - 1;

         brush.x(x2)
              .extent([
                   dataset.data[brushMin][nameX],
                   dataset.data[brushMax][nameX]
               ]);

         area.x(function (d) {
                 return x2(d[nameX]);
              })
              .y0(50)
              .y1(function (d) {
                  return y2(d[nameY]);
              });

         context.selectAll(".area")
                .datum(dataset.data)
                .attr("clip-path", "url(#lineplot-clip)")
                .attr("d", area);

         context.selectAll(".x.axis")
                .call(x2Axis);

         brush(d3.select(".x.brush"));

         context.select(".x.brush")
                .call(brush.event);
    };

    //---------------------------------------------------------
    // Helper functions
    //---------------------------------------------------------

    // Resizes the graph on window resize.
    function resizeRedraw() {
        if (initialized) {
            var totalHeight = $(options.container).height(),
                totalWidth  = $(options.container).width(),
                height      = totalHeight - options.margin.top - options.margin.bottom,
                width       = totalWidth - options.margin.left - options.margin.right;

            var nameX = dataset.nameX ? dataset.nameX : "name";
            var nameY = dataset.nameY ? dataset.nameY : "value";

            svg.attr("width", totalWidth)
               .attr("height", totalHeight);

            svg.select(".title")
               .attr("x", 10);

            svg.select(".subtitle")
               .attr("x", 10);

            x.range([0, width]);
            xAxis.scale(x);

            x2.range([0, width]);
            x2Axis.scale(x2);

            yAxis.tickSize(-width)
                 .outerTickSize(0);

            svg.select("#rect-clip")
               .attr("height", height)
               .attr("width", width);

            focus.select(".x.axis")
                 .call(xAxis);

            focus.select(".y.axis")
                 .call(yAxis);

            focus.select(".line")
                 .attr("d", line(dataset.data));

            context.select(".area")
                   .attr("d", area);

            focus.selectAll(".point")
                 .attr("cx", function (d) { return x(d[nameX]); })
                 .attr("cy", function (d) { return y(d[nameY]); });

            context.select(".x.axis")
                   .call(x2Axis);

            brush.x(x2)
                 .extent(brush.extent());
            brush(d3.select(".x.brush"));

            context.select(".x.brush")
                   .call(brush.event);
        }
    }

    // onmove brush functionality
    function brushed() {
        x.domain(brush.empty() ? x2.domain() : brush.extent());

        focus.select(".line").attr("d", line(dataset.data));
        focus.select(".x.axis").call(xAxis);
        focus.selectAll(".point")
             .attr("cx", function (d) { return x(d[nameX]); })
             .attr("cy", function (d) { return y(d[nameY]); });
    }

    // resize on window resize
    var resizeTimer;
    var windowWidth = $(window).width();
    $(window).resize(function () {
        if ($(this).width() !== windowWidth) {
            windowWidth = $(this).width();
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                resizeRedraw();
            }, 200);
        }
    });
}
