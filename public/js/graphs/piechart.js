/**
 * Graph Visualization Package
 * Written by Erik Novak <erik.novak@ijs.si>, 2016
 */

 /**
  * Creates the piechart chart object.
  * @param {Piechart~Options} _options - The options used for the visualization.
  * @example
  * // define the options used for the chart construction
  * var options = {
  *     container:     "#piechart-container",
  *     identifier:    "identifier",
  *     chartTitle:    "Title",
  *     chartSubtitle: "SubTitle",
  *     margin: {
  *         top:    20,
  *         left:   20,
  *         bottom: 20,
  *         right:  20
  *     },
  *     color: d3.scale.category10()
  * };
  * // create the piechart chart object
  * var customLineplot = new Piechart(options);
  */
function Piechart(_options) {

    /**
     * Options used for the visualization.
     * @typedef {object} Piechart~Options
     * @property {string} [container=null]   - The container identifier (normaly an html class or id).
     * @property {string} [identifier=null]  - The identifier used for css styling.
     * @property {string} [chartTitle=""]    - The chart title.
     * @property {string} [chartSubtitle=""] - The chart subtitle.
     * @property {object} [margin]           - Margin of the chart content.
     * @property {number} [margin.top=20]    - Top margin.
     * @property {number} [margin.left=20]   - Left margin.
     * @property {number} [margin.bottom=20] - Bottom margin.
     * @property {number} [margin.right=20]  - Right margin.
     * @property {function} [color = d3.scale.category10()] - The function used for the chart coloring.
     */
    var options = $.extend({
        container:     null,
        identifier:    null,
        chartTitle:    "",
        chartSubtitle: "",
        margin:        { top: 20, left: 20, bottom: 20, right: 20 },
        color:         d3.scale.category10()
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

    // Reusable parameters.
    // Used for manipulating with the SVG objects.
    var svg       = null,
        graphName = null,
        label     = null,
        value     = null,
        radius    = null,
        arc       = null,
        labelArc  = null,
        pie       = null,
        content   = null,
        legend    = null;

    /**
     * Sets the options.
     * @param {Lineplot~Options} _options - The options.
     */
    this.setOptions = function (_options) {
        if (typeof (_options) == 'undefined') throw "No options specified";
        options = $.extend(options, _options);
    }

    /**
     * Sets the dataset used for the visualization.
     * @param {Dataset} _dataset - The dataset.
     * @param {boolean} [redrawFlag=true] - If true, it redraws the graph. Otherwise,
     * only sets the dataset.
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
     * Draws the graph.
     */
    this.draw = function () {
        if (dataset == null) throw "Must initialize dataset";

        $(options.container + " svg").remove();

        var totalHeight = $(options.container).height(),
            totalWidth  = $(options.container).width(),
            height      = totalHeight - options.margin.top - options.margin.bottom,
            width       = totalWidth - options.margin.left - options.margin.right;

        label = dataset.nameLabel ? dataset.nameLabel : "label";
        value = dataset.nameValue ? dataset.nameValue : "value";

        graphName = options.identifier ? "piechart-" + options.identifier : "";

        radius = Math.min(height, width) / 2;

        svg = d3.select(options.container).append("svg")
                .attr("class", "piechart " + graphName)
                .attr("width", totalWidth)
                .attr("height", totalHeight);

        content = svg.append("g")
                     .attr("class", "content")
                     .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")")
                     .attr("width", width)
                     .attr("height", height);

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
           .style("font-size", "16px")
           .style("font-family", "sans-serif")
           .style("text-anchor", "start")
           .style("fill", "#F1E7E7")
           .text(options.chartSubtitle);

       //-----------------------
       // Piechart construction
       //-----------------------

        arc = d3.svg.arc()
                .outerRadius(radius - 10)
                .innerRadius(0);

        pie = d3.layout.pie()
                .sort(null)
                .value(function (d) { return d[value]; });

        var piechart = content.append("g")
                      .attr("class", "pie-slices")
                      .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

        piechart.selectAll(".pie-slice")
                .data(pie(dataset.data))
                .enter().append("path")
                .attr("class", "pie-slice")
                .attr("d", arc)
                .each(function (d) { this._current = d; })
                .style("fill", function (d, id) { return options.color(id); });

        //-----------------------
        // Legend construction
        //-----------------------

        legend = content.append("svg")
                        .attr("class", "legend")
                        .attr("width", width)
                        .attr("height", height);

        legend.selectAll(".legend-rect")
              .data(dataset.data)
              .enter().append("rect")
              .attr("class", "legend-rect")
              .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; })
              .attr("width", 18)
              .attr("height", 18)
              .style("fill", function (d, i) { return options.color(i); });

        legend.selectAll(".legend-label")
              .data(dataset.data)
              .enter().append("text")
              .attr("class", "legend-label")
              .attr("x", 24)
              .attr("y", function (d, i) { return i * 20 + 12; })
              .style("font-size", "12px")
              .style("font-family", "sans-serif")
              .style("text-anchor", "start")
              .text(function (d) { return d[label]; });

        initialized = true;
    }

    /**
     * Redraws the graph.
     */
    this.redraw = function () {
        if (!initialized) throw "Graph not initialized";

        label = dataset.nameLabel ? dataset.nameLabel : "label";
        value = dataset.nameValue ? dataset.nameValue : "value";

        svg.select(".title")
           .attr("x", 10)
           .attr("y", 40)
           .style("font-size", "20px")
           .style("font-family", "sans-serif")
           .style("text-anchor", "start")
           .text(options.chartTitle);

        if (options.chartSubtitle != "") {
            svg.select(".subtitle").remove();
            svg.append("text")
               .attr("class", "subtitle")
               .attr("x", 10)
               .attr("y", 65)
               .style("font-size", "18px")
               .style("font-family", "sans-serif")
               .style("text-anchor", "start")
               .style("fill", "#C7B7B7")
               .text(options.chartSubtitle);
        } else {
            svg.select(".subtitle").remove();
        }

        var piechart = d3.select(".pie-slices")

        var pieslices = piechart.selectAll(".pie-slice")
                                .data(pie(dataset.data));

        pieslices.transition().duration(500)
                 .attrTween("d", arcTween);

        pieslices.exit().remove();

        pieslices.enter().append("path")
                .attr("class", "pie-slice")
                .attr("d", arc)
                .each(function (d) { this._current = d; })
                .style("fill", function (d, id) { return options.color(id); });

        piechart.selectAll(".pie-label").remove();

        var legend_rect = legend.selectAll(".legend-rect")
                                .data(dataset.data);

        legend_rect.exit().remove();

        legend_rect.enter().append("rect")
                   .attr("class", "legend-rect")
                   .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; })
                   .attr("width", 18)
                   .attr("height", 18)
                   .style("fill", function (d, i) { return options.color(i); });

        var legend_label = legend.selectAll(".legend-label")
                                 .data(dataset.data);

        legend_label.text(function (d) { return d[label]; });

        legend_label.exit().remove();

        legend_label.enter().append("text")
                   .attr("class", "legend-label")
              .attr("x", 24)
              .attr("y", function (d, i) { return i * 20 + 12; })
              .style("font-size", "12px")
              .style("font-family", "sans-serif")
              .style("text-anchor", "start")
              .text(function (d) { return d[label]; });
    }

    //---------------------------------------------------------
    // Helper functions
    //---------------------------------------------------------

    // Resize the graph on window resize.
    function resizeRedraw() {
        if (initialized) {
            var totalHeight = $(options.container).height(),
                totalWidth = $(options.container).width(),
                height = totalHeight - options.margin.top - options.margin.bottom,
                width = totalWidth - options.margin.left - options.margin.right;

            radius = Math.min(height, width) / 2;

            svg.attr("width", totalWidth)
               .attr("height", totalHeight);

            content.attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")")
                   .attr("width", width)
                   .attr("height", height);

            arc.outerRadius(radius - 10);

            content.select(".pie-slices")
                   .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

            self.redraw();
        }
    }

    // arc interpolation
    function arcTween(animation) {
        var interpolate = d3.interpolate(this._current, animation);
        this._current = interpolate(0);
        return function (t) { return arc(interpolate(t)); }
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
