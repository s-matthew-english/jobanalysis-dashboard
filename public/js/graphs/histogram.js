/**
 * Graph Visualization Package
 * Written by Erik Novak <erik.novak@ijs.si>, 2016
 */

/**
 * Creates the lineplot chart object.
 * @param {Histogram~Options} _options - The options used for the visualization.
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
function Histogram(_options) {
    /**
     * Options used for the visualization.
     * @typedef {object} Histogram~Options
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
        margin:       { top: 20, left: 20, bottom: 20, right: 20 }
    }, _options);

    /**
     * The variable that contains the function itself (do not override!)
     */
    var self = this;

    /**
     * Te parameter storage. They are used for manipulating with SVG objects
     * in multiple functions.
     */
    var svg         = null,
        content     = null,
        x           = null,
        y           = null,
        xAxis       = null,
        yAxis       = null,
        identifier  = null,
        tip         = null,
        maxValue    = 0,
        initialized = false;

    /**
     * Data storage.
     * @property {Object} dataset - A JSON object containing the dataset info.
     * @property {string} [dataset.nameX = "name"] - The data key name. The name is used for the x axis.
     * @property {string} [dataset.nameY = "value"] - The data value name. It is what is displayed on the histogram.
     */
    var dataset = null;

    /**
     * Sets the dataset.
     */
    this.setDataset = function (_dataset, redrawFlag) {
        redrawFlag = typeof (redrawFlag) === 'undefined' ? true : redrawFlag;
        if (typeof (_dataset) == 'undefined') throw "No dataset specified";
        dataset = _dataset;
        if (redrawFlag) {
            if (initialized) self.redraw();
            else self.draw();
        }
    }

    /**
     * Redraws the histogram.
     */
    this.draw = function () {
        // reset the container
        $(options.container + " svg").remove();
        $(".histogram" + (identifier != "" ? "." + identifier : "") + ".d3-tip").remove();

        // get the container height and width
        var totalHeight = $(options.container).height(),
            totalWidth  = $(options.container).width(),
            height      = totalHeight - options.margin.top - options.margin.bottom,
            width       = totalWidth - options.margin.left - options.margin.right;

        // set the key-value names
        var nameX = dataset.nameX ? dataset.nameX : "name";
        var nameY = dataset.nameY ? dataset.nameY : "value";

        // calculations for the bar properties
        maxValue   = d3.max(dataset.data, function (d) { return d[nameY]; });
        identifier = options.identifier ? "histogram-" + options.identifier : "";

        // set the x axis
        x = d3.scale.ordinal()
              .rangeRoundBands([0, width])
              .domain(dataset.data.map(function (d) { return d[nameX]; }));

        xAxis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom");

        // set the y axis
        y = d3.scale.linear()
              .domain([0, maxValue])
              .range([height, 0]);

        yAxis = d3.svg.axis()
                  .scale(y)
                  .ticks(10)
                  .tickSize(-width)
                  .outerTickSize(0)
                  .tickFormat(d3.format("s"))
                  .orient("left");

        // setting the tooltip
        tip = d3.tip()
                .attr("class", "histogram " + identifier + " d3-tip")
                .offset([-10, 0])
                .html(function (d) {
                    var htmlText = "<div style='text-align:center;'>" + d[nameX] + "</div>";
                    htmlText += "<strong># of jobs:</strong> <span style='color:red'>" + d[nameY] + "</span>";
                    return htmlText;
                });

        // create the svg histogram container
        svg = d3.select(options.container).append("svg")
                .attr("class", "histogram" + (options.identifier ? " histogram-" + options.identifier : ""))
                .attr("width", totalWidth)
                .attr("height", totalHeight);

        content = svg.append("g")
                     .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")")
                     .append("g");

        content.call(tip);

        // x axis and labels
        content.append("g")
               .attr("class", "x axis")
               .attr("transform", "translate(0," + height + ")")
               .call(xAxis);

        content.selectAll(".x.axis .tick text")
               .attr("y", 7)
               .attr("x", -5)
               .attr("transform", "rotate(-50)")
               .style("text-anchor", "end");


        // y axis and labels
        var gyAxis = content.append("g")
                            .attr("class", "y axis")
                            .call(yAxis);

        gyAxis.selectAll("g").filter(function (d) { return d; })
                             .classed("minor", true);

        // append title of histogram
        svg.append("text")
           .attr("class", "title")
           .attr("x", 10)
           .attr("y", 40)
           .style("font-size", "20px")
           .style("font-family",  "sans-serif")
           .style("text-anchor", "start")
           .text(options.chartTitle);

        // append title of histogram
        svg.append("text")
           .attr("class", "subtitle")
           .attr("x", 10)
           .attr("y", 65)
           .style("font-size", "18px")
           .style("font-family", "sans-serif")
           .style("text-anchor", "start")
           .style("fill", "#C7B7B7")
           .text(options.chartSubtitle);

        // create chart
        var chart = content.append("g")
                           .attr("id", "chart-body")
                           .selectAll(".bar")
                           .data(dataset.data);

        var barWidth = calcBarWidth();

        chart.enter().append("rect")
             .attr("class", "bar")
             .attr("x", function (d) {
                 var xOffset = barWidth * 0.2;
                 return x(d[nameX]) + xOffset;
             })
             .attr("width", barWidth * 0.6)
             .attr("y", function (d) { return height; })
             .attr("height", function (d) { return 0; })
             .on('mouseover', tip.show)
             .on('mouseout', tip.hide)
             .transition().duration(1000)
             .attr("y", function (d) { return y(d[nameY]); })
             .attr("height", function (d) { return height - y(d[nameY]); })

        chart.exit().remove();

        // the graph is initialized
        initialized = true;
    }

    this.redraw = function () {
        var totalHeight = $(options.container).height(),
            height      = totalHeight - options.margin.top - options.margin.bottom;

        var nameX = dataset.nameX ? dataset.nameX : "name";
        var nameY = dataset.nameY ? dataset.nameY : "value";

        maxValue = d3.max(dataset.data, function (d) { return d[nameY]; });

        // change the domain
        x.domain(dataset.data.map(function (d) { return d[nameX]; }));
        xAxis.scale(x);

        y.domain([0, maxValue]);
        yAxis.scale(y);

        content.select(".x.axis").call(xAxis);
        content.selectAll(".x.axis .tick text")
               .attr("y", 7)
               .attr("x", -5)
               .attr("transform", "rotate(-50)")
               .style("text-anchor", "end");

        var gyAxis = content.select(".y.axis").call(yAxis);

        gyAxis.selectAll("g").filter(function (d) { return d; })
                             .classed("minor", true);

        var chart = content.select("#chart-body")
                           .selectAll(".bar")
                           .data(dataset.data);

        var barWidth = calcBarWidth();

        chart.transition().duration(1000)
             .attr("x", function (d) {
                 var xOffset = barWidth * 0.2;
                 return x(d[nameX]) + xOffset;
             })
             .attr("width", barWidth * 0.6)
             .attr("y", function (d) { return y(d[nameY]); })
             .attr("height", function (d) { return height - y(d[nameY]); });

        chart.exit().remove();

        chart.enter().append("rect")
             .attr("class", "bar")
             .attr("x", function (d) {
                 var xOffset = barWidth * 0.2;
                 return x(d[nameX]) + xOffset;
             })
             .attr("y", function (d) { return height; })
             .attr("width", barWidth * 0.6)
             .attr("height", function (d) { return 0; })
             .on('mouseover', tip.show)
             .on('mouseout', tip.hide)
             .transition().duration(1000)
             .attr("y", function (d) { return y(d[nameY]); })
             .attr("height", function (d) { return height - y(d[nameY]); })
    }

    function resizeRedraw() {
        var totalHeight = $(options.container).height(),
            totalWidth  = $(options.container).width(),
            height      = totalHeight - options.margin.top - options.margin.bottom,
            width       = totalWidth - options.margin.left - options.margin.right;

        // set the key-value names
        var nameX = dataset.nameX ? dataset.nameX : "name";
        var nameY = dataset.nameY ? dataset.nameY : "value";

        svg.attr("width", totalWidth)
           .attr("height", totalHeight);

        // set the x axis
        x.rangeRoundBands([0, width]);
        xAxis.scale(x);

        yAxis.tickSize(-width)
             .outerTickSize(0);

        content.select(".x.axis")
               .call(xAxis);

        content.selectAll(".x.axis .tick text")
               .attr("y", 7)
               .attr("x", -5)
               .attr("transform", "rotate(-50)")
               .style("text-anchor", "end");

        // y axis and labels
        var gyAxis = content.select(".y.axis")
                            .call(yAxis);

        svg.select(".title")
           .attr("x", 10)
           .attr("y", 40)
           .style("text-anchor", "start");

        svg.select(".subtitle")
           .attr("x", 10)
           .attr("y", 65)
           .style("text-anchor", "start");

        var barWidth = calcBarWidth();

        var chart = content.select("#chart-body")
                           .selectAll(".bar");

        chart.attr("x", function (d) {
                var xOffset = barWidth * 0.2;
                return x(d[nameX]) + xOffset;
             })
             .attr("width", barWidth * 0.6);

    }

    //-----------------------------------------
    // Helper functions
    //-----------------------------------------

    var capitalizeString = function (str) {
        return str.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
    };

    // calculates the width of the bars
    function calcBarWidth() {
       var totalWidth = $(options.container).width(),
           width = totalWidth - options.margin.left - options.margin.right;

        return width / dataset.data.length;
    }

    // resize on window resize
    var resizeTimer;
    $(window).resize(function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resizeRedraw();
        }, 200);
    });
}
