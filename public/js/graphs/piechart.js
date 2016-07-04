/**
 * Graph visualizations
 * Written by Erik Novak <erik.novak@ijs.si>, 2016
 */


function Piechart(_options) {
    
    /**
     * The options used at the graph initialization.
     */ 
    var options = $.extend({
        container: null,
        name:      null,
        margin: { top: 20, left: 20, bottom: 20, right: 20 },
        color:  d3.scale.category10()
    }, _options);
    
    // class container
    var self = this;

    /**
     * Data storage
     * @property {Object} dataset - A JSON object containing the dataset info.
     * @property {string} [dataset.title] - The title of the graph and dataset.
     * @property {string} [dataset.nameX = "name"] - The identifier used to access the data used for the x axis.
     * @property {string} [dataset.nameY = "value"] - The identifier used to access the data used for the y axis.
     * @property {string} dataset.data - Data storage. 
     * 
     */
    var dataset = null;
    
    var initialized = false;

    /**
     * Reusable parameters. Used for manipulating with the SVG objects.
     */ 
    var svg      = null,
        label    = null,
        value    = null,
        radius   = null,
        arc      = null,
        labelArc = null,
        pie      = null,
        content  = null,
        legend   = null;
        
    this.setDataset = function (_dataset, redrawFlag) {
        redrawFlag = typeof (redrawFlag) === 'undefined' ? true : redrawFlag;
        
        if (typeof (_dataset) == 'undefined') throw "No dataset specified";
        dataset = _dataset;

        if (redrawFlag) {
            if (initialized) self.redraw();
            else self.draw();
        }
    }

    this.draw = function () { 
        // reset the container
        $(options.container + " svg").remove();
        
        // get the container height and width
        var totalHeight = $(options.container).height(),
            totalWidth  = $(options.container).width(),
            height      = totalHeight - options.margin.top - options.margin.bottom,
            width       = totalWidth - options.margin.left - options.margin.right;
        
        // set the key-value names
        label = dataset.nameLabel ? dataset.nameLabel : "label";
        value = dataset.nameValue ? dataset.nameValue : "value";

        // set graph name
        graphName = options.name ? "piechart-" + options.name : "";
        
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
        
        // title
        if (dataset.title) {
            svg.append("text")
               .attr("class", "title")
               .attr("x", 10)
               .attr("y", 40)
               .style("font-size", "20px")
               .style("font-family", "sans-serif")
               .style("text-anchor", "start")
               .text(dataset.title);
        }
        
        // subtitle
        if (dataset.subtitle) {
            svg.append("text")
               .attr("class", "subtitle")
               .attr("x", 10)
               .attr("y", 65)
               .style("font-size", "16px")
               .style("font-family", "sans-serif")
               .style("text-anchor", "start")
               .style("fill", "#F1E7E7")
               .text(dataset.subtitle);
        }

        // piechart construction
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
        
        legend = content.append("svg")
                        .attr("class", "legend")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");
        
        // create legend
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
        

        // the graph is initialized
        initialized = true;
    }

    this.redraw = function () {
        
        // set the key-value names
        label = dataset.nameLabel ? dataset.nameLabel : "label";
        value = dataset.nameValue ? dataset.nameValue : "value";
        
        // title
        if (dataset.title) {
            svg.select(".title")
               .attr("x", 10)
               .attr("y", 40)
               .style("font-size", "20px")
               .style("font-family", "sans-serif")
               .style("text-anchor", "start")
               .text(dataset.title);
        }
        
        // subtitle
        if (dataset.subtitle) {
            svg.select(".subtitle").remove();
            svg.append("text")
               .attr("class", "subtitle")
               .attr("x", 10)
               .attr("y", 65)
               .style("font-size", "18px")
               .style("font-family", "sans-serif")
               .style("text-anchor", "start")
               .style("fill", "#C7B7B7")
               .text(dataset.subtitle);
        } else {
            svg.select(".subtitle").remove();
        }

        var piechart = d3.select(".pie-slices")
        
        // update pie slices
        var pieslices = piechart.selectAll(".pie-slice")
                                .data(pie(dataset.data));

        // update
        pieslices.transition().duration(500)
                 .attrTween("d", arcTween);
        
        // exit
        pieslices.exit().remove();
        
        // enter
        pieslices.enter().append("path")
                .attr("class", "pie-slice")
                .attr("d", arc)
                .each(function (d) { this._current = d; })
                .style("fill", function (d, id) { return options.color(id); });

        piechart.selectAll(".pie-label").remove();
        
        // update legend
        var legend_rect = legend.selectAll(".legend-rect")
                                .data(dataset.data);
        
        // exit
        legend_rect.exit().remove();
        
        // enter
        legend_rect.enter().append("rect")
                   .attr("class", "legend-rect")
                   .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; })
                   .attr("width", 18)
                   .attr("height", 18)
                   .style("fill", function (d, i) { return options.color(i); });
        
        // update legend
        var legend_label = legend.selectAll(".legend-label")
                                 .data(dataset.data);

        // update
        legend_label.text(function (d) { return d[label]; });

        // exit
        legend_label.exit().remove();
        
        // enter
        legend_label.enter().append("text")
                   .attr("class", "legend-label")
              .attr("x", 24)
              .attr("y", function (d, i) { return i * 20 + 12; })
              .style("font-size", "12px")
              .style("font-family", "sans-serif")
              .style("text-anchor", "start")
              .text(function (d) { return d[label]; });
    }
    
    function resizeRedraw() { 
        if (initialized) {
            // get the container height and width
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