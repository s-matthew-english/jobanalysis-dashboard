/**
 * The factory function for construction the specific histogram.
 * 
 */ 
function Histogram(_options) {
    if (_options.histogramType == "continuous") {
        return new ContinuousHistogram(_options);
    } else {
        return new DiscreteHistogram(_options);
    }
}


/**
 * Constructs a discrete histogram.
 * @param {Object} obj - The construction parameters.
 * @param {string} obj.histogramContainer - The container identifier.
 * @param {string} [obj.histogramName] - The histogram identifier. Can specify the style only for this histogram.
 * @param {boolean} [obj.zoomable = false] - If the histogram is zoomable.
 */ 
function DiscreteHistogram(_options) {
    /**
     * The options used at histogram initialization.
     */ 
    var options = $.extend({
        histogramContainer: null,
        histogramName:      null,
        zoomable:           false,
        margin: { top: 50, left: 70, bottom: 100, right: 30 }
    }, _options);

    /**
     * The variable that contains the function itself (do not override!)
     */ 
    const self = this;

    /**
     * Te parameter storage. They are used for manipulating with SVG objects 
     * in multiple functions.
     */ 
    var svg                = undefined,
        rectClip           = undefined,
        histogramContainer = undefined,
        x                  = undefined,
        y                  = undefined, 
        xAxis              = undefined,
        yAxis              = undefined,
        zoom               = undefined,
        histogramName      = undefined,
        maxValue           = 0;

    /**
     * Data storage.
     * @property {Object} dataset - A JSON object containing the dataset info.
     * @property {string} [dataset.title] - The dataset name. It is also the title of the histogram.
     * @property {string} [dataset.dataKeyName = "name"] - The data key name. The name is used for the x axis.
     * @property {string} [dataset.dataValueName = "value"] - The data value name. It is what is displayed on the histogram.
     * @property {string} [dataset.yAxisName] - 
     * { name: String, yAxisName: String, data: [{ name: String, value: number }] }
     */ 
    var dataset = undefined;

    /**
     * Set the data in the histogram and redraw's it.
     * @param {}
     */ 
    this.setData = function (_data) {
        if (_data == undefined) {
            throw "No data specified!";
        }
        dataset = _data;
        self.draw();
    }

    /**
     * Redraws the histogram.
     */ 
    this.draw = function () {
        // reset the container
        $(options.histogramContainer + " svg").remove();
        $(".histogram" + (histogramName != "" ? "." + histogramName : "") + ".d3-tip").remove();
        
        // get the container height and width
        var histogramTotalHeight = $(options.histogramContainer).height(),
            histogramTotalWidth  = $(options.histogramContainer).width(),
            histogramHeight = histogramTotalHeight - options.margin.top - options.margin.bottom,
            histogramWidth  = histogramTotalWidth - options.margin.left - options.margin.right;
        
        // set the key-value names
        var dataKey   = dataset.dataKeyName ? dataset.dataKeyName : "name";
        var dataValue = dataset.dataValueName ? dataset.dataValueName : "value";

        // calculations for the bar properties
        maxValue      = d3.max(dataset.data, function (d) { return d[dataValue]; });
        histogramName = options.histogramName ? "histogram-" + options.histogramName : "";

        // set the x axis
        x = d3.scale.ordinal()
                    .rangeRoundBands([0, histogramWidth], .1)
                    .domain(dataset.data.map(function (d) { return d[dataKey]; }));
            
        xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");

        // set the y axis
        y = d3.scale.linear()
                    .domain([0, maxValue])
                    .range([histogramHeight, 0]);
        
        yAxis = d3.svg.axis()
                      .scale(y)
                      .ticks(10)
                      .tickSize(-histogramWidth)
                      .outerTickSize(0)
                      .tickFormat(d3.format("s"))
                      .orient("left");
        
        // setting the tooltip
        var tip = d3.tip()
                    .attr("class", "histogram " + histogramName + " d3-tip")
                    .offset([-10, 0])
                    .html(function (d) {
                        var htmlText = "<div style='text-align:center;'>" + d[dataKey] + "</div>";
                        htmlText += "<strong># of jobs:</strong> <span style='color:red'>" + d[dataValue] + "</span>";
                        return htmlText;
                    });

        // create the svg histogram container
        svg = d3.select(options.histogramContainer).append("svg")
                    .attr("class", "histogram" + (options.histogramName ? " histogram-" + options.histogramName : ""))
                    .attr("width", histogramTotalWidth)
                    .attr("height", histogramTotalHeight);
        
        // if histogram is zoomable            
        if (options.zoomable) {
            zoom = d3.behavior.zoom()
                              .x(x)
                              .scaleExtent([1, 1000])
                              .on("zoom", onZoom);
            svg.call(zoom);
        }
        
        var clip = svg.append("defs").append("svg:clipPath")
                      .attr("id", "clip")
                      .append("rect")
                      .attr("id", "clip-rect")
                      .attr("x", 0)
                      .attr("y", 0)
                      .attr("height", histogramHeight)
                      .attr("width", histogramWidth);
        
        histogramContainer = svg.append("g")
                                .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")")
                                .append("g");

        histogramContainer.call(tip);

        // x axis and labels
        histogramContainer.append("g")
                          .attr("class", "x axis")
                          .attr("transform", "translate(0," + histogramHeight + ")")
                          .call(xAxis);

        histogramContainer.selectAll("text")
                            .attr("class", "x-labels")
                            .attr("y", 7)
                            .attr("x", -5)
                            .attr("transform", "rotate(-50)")
                            .style("text-anchor", "end");
        
        
        // y axis and labels
        var gyAxis = histogramContainer.append("g")
                                   .attr("class", "y axis")
                                   .call(yAxis);
        
        gyAxis.selectAll("g").filter(function (d) { return d; })
                             .classed("minor", true);
        
        if (dataset.yAxisName) {
            gyAxis.append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("x", -histogramTotalHeight / 3)
                  .attr("y", -35)
                  .style("font-size", "12px")
                  .style("text-anchor", "end")
                  .text(dataset.yAxisName);
        }
        // append title of histogram
        histogramContainer.append("text")
              .attr("class", "title")
              .attr("x", histogramTotalWidth / 2)
              .attr("y", -10)
              .style("font-size", "18px")
              .style("font-family",  "sans-serif")
              .style("text-anchor", "end")
              .text(dataset.title);
        
        // create chart  
        var chart = histogramContainer.append("g")
                          .attr("id", "chart-body")
                          .attr("clip-path", "url(#clip)")
                          .selectAll(".bar")
                          .data(dataset.data);
        
        var barW = barWidth();

        chart.enter().append("rect")
                     .attr("class", "bar")
                     .attr("x", function (d) {
                        var xOffset = options.zoomable ? -barW * 0.3 : barW * 0.2;
                        return x(d[dataKey]) + xOffset;
                      })
                     .attr("y", function (d) { return histogramHeight; })
                     .attr("width", barW * 0.6)
                     .attr("height", function (d) { return 0; })
                     .on('mouseover', tip.show)
                     .on('mouseout', tip.hide)
                     .transition().duration(1000)
                     .attr("y", function (d) { return y(d[dataValue]); })
                     .attr("height", function (d) { return histogramHeight - y(d[dataValue]); })
                     
        chart.exit().remove();
    }
    
    function redraw() { 
        var histogramTotalHeight = $(options.histogramContainer).height(),
            histogramTotalWidth = $(options.histogramContainer).width(),
            histogramHeight = histogramTotalHeight - options.margin.top - options.margin.bottom,
            histogramWidth = histogramTotalWidth - options.margin.left - options.margin.right;
        
        // set the key-value names
        var dataKey = options.dataKeyName;
        var dataValue = options.dataValueName;

        svg.attr("width", histogramTotalWidth)
           .attr("height", histogramTotalHeight);
        
        // set the x axis
        x.rangeRoundBands([0, histogramWidth], .1);
        xAxis.scale(x);
        
        yAxis.tickSize(-histogramWidth)
             .outerTickSize(0);
        
        // if histogram is zoomable            
        if (options.zoomable) {
            zoom.x(x);
        }
        
        svg.select("#clip-rect")
           .attr("x", 0)
           .attr("y", options.margin.top)
           .attr("height", histogramTotalHeight)
           .attr("width", histogramWidth);

        histogramContainer.select(".x.axis")
                          .call(xAxis);

        histogramContainer.selectAll(".x-labels")
                          .attr("y", 7)
                          .attr("x", -5)
                          .attr("transform", "rotate(-50)")
                          .style("text-anchor", "end");
        
        // y axis and labels
        var gyAxis = histogramContainer.select(".y.axis")
                                       .call(yAxis);
                
        gyAxis.selectAll(".minor")
              .attr("x", -histogramHeight / 2)
              .attr("y", -35)
              .style("font-size", "12px")
              .style("text-anchor", "end");
        
        // append title of histogram
        histogramContainer.select(".title")
              .attr("x", histogramTotalWidth / 2)
              .attr("y", -10)
              .style("text-anchor", "center");
        
        var barW = barWidth();

        var chart = histogramContainer.select("#chart-body")
                                      .attr("clip-path", "url(#clip)");
 
        chart.selectAll(".bar")
                     .attr("x", function (d) {
                         var xOffset = options.zoomable ? -barW * 0.3 : barW * 0.2;
                         return x(d[dataKey]) + xOffset;
                     })
                     .attr("width", barW * 0.6);

    }

    //-----------------------------------------
    // Helper functions
    //-----------------------------------------

    var capitalizeString = function (str) {
        return str.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
    };
    
    // calculates the width of the bars
    function barWidth() {
       var histogramTotalWidth = $(options.histogramContainer).width(),
           histogramWidth = histogramTotalWidth - options.margin.left - options.margin.right;

        return histogramWidth / dataset.data.length;
    }
    
    // zoom functionality
    function onZoom() {
        var barW = barWidth();
        svg.select(".x.axis").call(xAxis);
        histogramContainer.selectAll("rect.bar")
                              .attr("x", function (d) { return x(d[dataKey]) - barW * d3.event.scale * 0.3; })
                              .attr("width", barW * d3.event.scale * 0.6)
    }
    
    // resize on window resize 
    var resizeTimerHist;
    $(window).resize(function () {
        redraw();
    });
}




function ContinuousHistogram(_options) {
    /**
     * The options used at histogram initialization.
     */ 
    var options = $.extend({
        histogramContainer: null,
        histogramName:      null,
        zoomable:           false,
        dataKeyName:        "name",
        dataValueName:      "value",
        margin: { top: 50, left: 70, bottom: 100, right: 30 }
    }, _options);
    
    /**
     * The variable that contains the function itself (do not override!)
     */ 
    const self = this;
    
    /**
     * Te parameter storage. They are used for manipulating with SVG objects 
     * in multiple functions.
     */ 
    var svg                = undefined,
        rectClip           = undefined,
        histogramContainer = undefined,
        x                  = undefined,
        y                  = undefined, 
        xAxis              = undefined,
        yAxis              = undefined,
        zoom               = undefined,
        histogramName      = undefined,
        maxValue           = 0;
    
    /**
     * Data storage.
     * @property {Object} dataset - A JSON object containing the dataset info.
     * { name: String, yAttribute: String, data: [{ name: String, value: number }] }
     */ 
    var dataset = undefined;
    
    /**
     * Set the data in the histogram and redraw's it.
     */ 
    this.setData = function (_data) {
        if (_data == undefined) {
            throw "No data specified!";
        }
        dataset = _data;
        self.draw();
    }
    
    /**
     * Redraws the histogram.
     */ 
    this.draw = function () {
        
        // reset the container
        $(options.histogramContainer + " svg").remove();
        $(".histogram" + (histogramName != "" ? "." + histogramName : "") + ".d3-tip").remove();
        
        var histogramTotalHeight = $(options.histogramContainer).height(),
            histogramTotalWidth = $(options.histogramContainer).width(),
            histogramHeight = histogramTotalHeight - options.margin.top - options.margin.bottom,
            histogramWidth = histogramTotalWidth - options.margin.left - options.margin.right;
        
        // set the key-value names
        var dataKey = options.dataKeyName;
        var dataValue = options.dataValueName;

        // calculations for the bar properties
        maxValue      = d3.max(dataset.data, function (d) { return d[dataValue]; });
        histogramName = options.histogramName ? "histogram-" + options.histogramName : "";
        
        // set the x axis
        var dateTimeFormat = d3.time.format.multi([
            ["%b %d", function (d) { return d.getDate() != 1; }],
            ["%B", function (d) { return d.getMonth(); }],
            ["%Y", function () { return true; }]
        ]);

        x = d3.time.scale()
                   .range([0, histogramWidth])
                   .domain([dataset.data[0][dataKey], dataset.data[dataset.data.length - 1][dataKey]]);
            
        xAxis = d3.svg.axis()
                      .scale(x)
                      .tickFormat(dateTimeFormat)
                      .orient("bottom");
      
        // set the y axis
        y = d3.scale.linear()
                    .domain([0, maxValue])
                    .range([histogramHeight, 0]);
        
        yAxis = d3.svg.axis()
                      .scale(y)
                      .ticks(10)
                      .tickSize(-histogramWidth)
                      .outerTickSize(0)
                      .tickFormat(d3.format("s"))
                      .orient("left");
        
        // setting the tooltip
        var tip = d3.tip()
                    .attr("class", "histogram " + histogramName + " d3-tip")
                    .offset([-10, 0])
                    .html(function (d) {
                        var htmlText = "<div style='text-align:center;'>" + d[dataKey].toDateString() + "</div>";
                        htmlText += "<strong># of jobs:</strong> <span style='color:red'>" + d[dataValue] + "</span>";
                        return htmlText;
                    });
        
        // create the svg histogram container
        svg = d3.select(options.histogramContainer).append("svg")
                    .attr("class", "histogram" + (options.histogramName ? " histogram-" + options.histogramName : ""))
                    .attr("width", histogramTotalWidth)
                    .attr("height", histogramTotalHeight);
        
        // if histogram is zoomable            
        if (options.zoomable) {
            zoom = d3.behavior.zoom()
                              .x(x)
                              .scaleExtent([1, 100])
                              .on("zoom", onZoom);
            svg.call(zoom);
        }
        
        var clip = svg.append("defs").append("svg:clipPath")
                      .attr("id", "clip")
                      .append("rect")
                      .attr("id", "clip-rect")
                      .attr("x", 0)
                      .attr("y", 0)
                      .attr("height", histogramHeight)
                      .attr("width", histogramWidth);
        
        histogramContainer = svg.append("g")
                                .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")")
                                .append("g");
        
        histogramContainer.call(tip);
        
        // x axis and labels
        histogramContainer.append("g")
                          .attr("class", "x axis")
                          .attr("transform", "translate(0," + histogramHeight + ")")
                          .call(xAxis);
        
        // y axis and labels
        var gyAxis = histogramContainer.append("g")
                                   .attr("class", "y axis")
                                   .call(yAxis);
        
        gyAxis.selectAll("g").filter(function (d) { return d; })
                             .classed("minor", true);
        
        gyAxis.append("text")
              .attr("transform", "rotate(-90)")
              .attr("x", -histogramTotalHeight / 3)
              .attr("y", -35)
              .style("font-size", "12px")
              .style("text-anchor", "end")
              .text(dataset.yAttribute);
        
        // append title of histogram
        histogramContainer.append("text")
              .attr("class", "title")
              .attr("x", histogramTotalWidth / 2)
              .attr("y", -10)
              .style("font-size", "18px")
              .style("font-family", "sans-serif")
              .style("text-anchor", "end")
              .text(dataset.name);
        
        // create chart  
        var chart = histogramContainer.append("g")
                          .attr("id", "chart-body")
                          .attr("clip-path", "url(#clip)")
                          .selectAll(".bar")
                          .data(dataset.data);
        
        var barW = barWidth();
        
        chart.enter().append("rect")
                     .attr("class", "bar")
                     .attr("x", function (d) {
                        var xOffset = -barW * 0.3;
                        return x(d[dataKey]) + xOffset;
                     })
                     .attr("y", function (d) { return histogramHeight; })
                     .attr("width", barW * 0.6)
                     .attr("height", function (d) { return 0; })
                     .on('mouseover', tip.show)
                     .on('mouseout', tip.hide)
                     .transition().duration(1000)
                     .attr("y", function (d) { return y(d[dataValue]); })
                     .attr("height", function (d) { return histogramHeight - y(d[dataValue]); })
        
        chart.exit().remove();
        
        
    }
    
    this.redraw = function () {
        var histogramTotalHeight = $(options.histogramContainer).height(),
            histogramTotalWidth = $(options.histogramContainer).width(),
            histogramHeight = histogramTotalHeight - options.margin.top - options.margin.bottom,
            histogramWidth = histogramTotalWidth - options.margin.left - options.margin.right;
        
        // set the key-value names
        var dataKey = options.dataKeyName;
        var dataValue = options.dataValueName;
        
        svg.attr("width", histogramTotalWidth)
           .attr("height", histogramTotalHeight);
        
        // set the x axis
        x.range([0, histogramWidth]);
        xAxis.scale(x);
        
        yAxis.tickSize(-histogramWidth)
             .outerTickSize(0);
        
        // if histogram is zoomable            
        if (options.zoomable) {
            zoom.x(x);
        }
        
        svg.select("#clip-rect")
           .attr("height", histogramHeight)
           .attr("width", histogramWidth);
        
        histogramContainer.select(".x.axis")
                          .call(xAxis);
        
        // y axis and labels
        var gyAxis = histogramContainer.select(".y.axis")
                                       .call(yAxis);
        
        gyAxis.selectAll(".minor")
              .attr("x", -histogramHeight / 2)
              .attr("y", -35)
              .style("font-size", "12px")
              .style("text-anchor", "end");
        
        // append title of histogram
        histogramContainer.select(".title")
              .attr("x", histogramTotalWidth / 2)
              .attr("y", -10)
              .style("text-anchor", "center");
        
        var barW = barWidth();
        
        var chart = histogramContainer.select("#chart-body")
                                      .attr("clip-path", "url(#clip)");
        
        chart.selectAll(".bar")
                     .attr("x", function (d) {
                        var xOffset = -barW * 0.3;
                        return x(d.name) + xOffset;
                     })
                     .attr("width", barW * 0.6)

    }
    
    //-----------------------------------------
    // Helper functions
    //-----------------------------------------
    
    var capitalizeString = function (str) {
        return str.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
    };
    
    // calculates the width of the bars
    function barWidth() {
        var histogramTotalWidth = $(options.histogramContainer).width(),
            histogramWidth = histogramTotalWidth - options.margin.left - options.margin.right;
        
        // set the key-value names
        var dataKey = options.dataKeyName;
        var dataValue = options.dataValueName;

        var firstDate = dataset.data[0][dataKey], 
            lastDate = dataset.data[dataset.data.length - 1][dataKey];
        return histogramWidth / dayDiff(firstDate, lastDate);
    }
    
    // gets the number of days between two dates
    function dayDiff(first, second) {
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }
    
    // zoom functionality
    function onZoom() {
        // set the key-value names
        var dataKey = options.dataKeyName;
        var dataValue = options.dataValueName;

        var barW = barWidth();
        svg.select(".x.axis").call(xAxis);
        histogramContainer.selectAll("rect.bar")
                          .attr("x", function (d) { return x(d[dataKey]) - barW * d3.event.scale * 0.3; })
                          .attr("width", barW * d3.event.scale * 0.6)
    }
    
    
    // resize on window resize 
    var resizeTimerHist;
    $(window).resize(function () {
        self.redraw();
    });
}