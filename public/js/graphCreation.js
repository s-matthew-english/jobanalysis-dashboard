 /**
  * Contains the graph object constructors.
  */

// Creates the Piechart graph
var datePiechart = new Piechart({
    container: "#analytics-chart-jobs-by-dates-piechart",
    name:      "daily-skill",
    margin:    { top: 100, left: 20, bottom: 20, right: 20 },
})

// Creates the Lineplot chart
var dateLineplot = new Lineplot({
    container:  "#analytics-chart-jobs-by-dates",
    identifier: "date",
    chartTitle: "Job Posts by Dates",
    margin:     { top: 50, left: 30, bottom: 100, right: 20 }
});

// Creates the skill Histogram
var skillHistogram = new Histogram({
    container: "#analytics-chart-skills-by-frequency",
    name:      "skill",
    margin:    { top: 80, left: 30, bottom: 100, right: 20 }
});

// Creates the location Histogram
var locationHistogram = new Histogram({
    container: "#analytics-chart-location-by-frequency",
    name:      "location",
    margin:    { top: 80, left: 30, bottom: 100, right: 20 }
});

// Creates the countries Histogram
var countriesHistogram = new Histogram({
    container: "#analytics-chart-countries-by-frequency",
    name:      "countries",
    margin:    { top: 80, left: 30, bottom: 100, right: 20 }
});
