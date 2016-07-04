/**
 * Graph visualizations
 * Written by Erik Novak <erik.novak@ijs.si>, 2016
 */ 

function Lineplot(_options) {
    /**
     * The options used at the graph initialization.
     */ 
    var options = $.extend({
        container: null,
        name:      null,
        margin: { top: 50, left: 30, bottom: 100, right: 20 }
    }, _options);
    
    // class container
    const self = this;

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
    
    /**
     * On point hover callback function
     */ 
    var mouseOverPointCallback = null;
    var mouseOutPointCallback  = null;

    /**
     * Reusable parameters. Used for manipulating with the SVG objects.
     */ 
    var svg     = null,
        x       = null,
        y       = null,
        x2      = null,
        y2      = null,
        xAxis   = null,
        yAxis   = null,
        x2Axis  = null,
        nameX   = null,
        nameY   = null,
        line    = null,
        area    = null,
        focus   = null,
        context = null;

    /**
     * Sets the dataset.
     */  
    this.setDataset = function (_dataset, redrawFlag) {
        redrawFlag = typeof (redrawFlag) === 'undefined' ? true : redrawFlag;

        if (typeof (_dataset) == 'undefined') throw "No dataset specified";
        dataset = _dataset;
        if (redrawFlag) {
            self.draw();
        }
    }
    
    /**
     * Sets the on mouseover point callback function. 
     */ 
    this.setMouseOverPointCallback = function (func) {
        mouseOverPointCallback = func;
    }
    
    /**
     * Sets the on mouseout point callback function. 
     */ 
    this.setMouseOutPointCallback = function (func) { 
        mouseOutPointCallback = func;
    }

    this.draw = function () { 
        // reset the container
        $(options.container + " svg").remove();
        $(options.container + " .lineplot .d3-tip").remove();

        // get the container height and width
        var totalHeight = $(options.container).height(),
            totalWidth  = $(options.container).width(),
            height      = totalHeight - options.margin.top - options.margin.bottom,
            width       = totalWidth - options.margin.left - options.margin.right;

        // set the key-value names
        nameX = dataset.nameX ? dataset.nameX : "name";
        nameY = dataset.nameY ? dataset.nameY : "value";
        
        // set graph name
        graphName = options.name ? "lineplot-" + options.name : "";

        // focus axis
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
        
        // context axis
        x2 = d3.time.scale().range([0, width]);
        y2 = d3.scale.linear().range([50, 0]);
        
        x2Axis = d3.svg.axis().scale(x2).orient("bottom");
        
        // svg container
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
        
        // append title of histogram
        svg.append("text")
           .attr("class", "title")
           .attr("x", 10)
           .attr("y", 40)
           .style("font-size", "20px")
           .style("font-family", "sans-serif")
           .style("text-anchor", "start")
           .text(dataset.title);

        // the big picture graph
        
        // define the line 
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
        
        // define the tooltip
        var tip = d3.tip()
                    .attr("class", "lineplot " + graphName + " d3-tip")
                    .offset([-10, 0])
                    .html(function (d) { 
                        var htmlText = "<div style='text-align:center;'>" + d[nameX].toDateString() + "</div>";
                        htmlText += "<strong># of jobs:</strong> <span style='color:red'>" + d[nameY] + "</span>";
                        return htmlText;
                    });
        svg.call(tip);

        // Add the scatter points
        focus.selectAll(".point")
                 .data(dataset.data)
                 .enter().append("circle")
                 .attr("class", "point")
                 .attr("clip-path", "url(#lineplot-clip)")
                 .attr("r", 3)
                 .attr("cx", function (d) { return x(d[nameX]); })
                 .attr("cy", function (d) { return y(d[nameY]); })
                 .on("mouseover", function (d) {
                     if (mouseOverPointCallback) {
                         mouseOverPointCallback(d);
                     }
                     tip.show(d);
                 })
                 .on("mouseout", function (d) {
                     if (mouseOutPointCallback) {
                         mouseOutPointCallback(d);
                     }
                     tip.hide(d);
                 });
        

        // the brush container
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
                 .interpolate("monotone")
                 .x(function (d) { return x2(d[nameX]); })
                 .y0(50)
                 .y1(function (d) { return y2(d[nameY]); });

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
    }

    function resizeRedraw() {
        // get the container height and width
        var totalHeight = $(options.container).height(),
            totalWidth  = $(options.container).width(),
            height      = totalHeight - options.margin.top - options.margin.bottom,
            width       = totalWidth - options.margin.left - options.margin.right;

        // set the key-value names
        var nameX = dataset.nameX ? dataset.nameX : "name";
        var nameY = dataset.nameY ? dataset.nameY : "value";
        
        svg.attr("width", totalWidth)
           .attr("height", totalHeight);

        // append title of histogram
        svg.select(".title")
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
        
        // update brush
        brush.x(x2)
             .extent(brush.extent());
        
        brush(d3.select(".x.brush"));

        context.select(".x.brush")
               .call(brush.event);
    }
    
    //---------------------------------------------------------
    // Helper functions
    //---------------------------------------------------------

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
    $(window).resize(function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resizeRedraw();
        }, 200);
    });
}