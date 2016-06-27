/**
 * Creates the histogram objects
 */ 

// creates the location histogram
var dateHistogram = Histogram({
    histogramContainer: "#analytics-chart-jobs-by-dates",
    histogramName:      "date",
    histogramType:      "continuous",
    margin: { top: 50, left: 80, bottom: 30, right: 30 }
});

// creates the skill histogram
var skillHistogram = Histogram({
    histogramContainer: "#analytics-chart-skills-by-frequency",
    histogramName:      "skill",
    margin: { top: 50, left: 70, bottom: 100, right: 30 }
});

// creates the location histogram
var locationHistogram = Histogram({
    histogramContainer: "#analytics-chart-location-by-frequency",
    histogramName:      "location",
    margin: { top: 50, left: 70, bottom: 100, right: 30 }
});
