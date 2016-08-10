 /**
  * Contains the graph object constructors.
  */

// Creates the Piechart graph
var datePiechart = new Piechart({
    container:  "#analytics-chart-jobs-by-dates-piechart",
    identifier: "daily-skill",
    chartTitle: "Top 10 Skills",
    margin:    { top: 100, left: 20, bottom: 20, right: 20 },
});

// Creates the Lineplot chart
var dateLineplot = new Lineplot({
    container:  "#analytics-chart-jobs-by-dates",
    identifier: "date",
    chartTitle: "Job Posts by Dates",
    margin:     { top: 50, left: 40, bottom: 100, right: 20 }
});

// Creates the skill Histogram
var skillHistogram = new Histogram({
    container:     "#analytics-chart-skills-by-frequency",
    identifier:    "skill",
    chartTitle:    "Job Posts by Skills",
    chartSubtitle: "Top 50",
    margin:     { top: 80, left: 40, bottom: 100, right: 20 }
});

// Creates the location Histogram
var locationHistogram = new Histogram({
    container:     "#analytics-chart-location-by-frequency",
    identifier:    "location",
    chartTitle:    "Job Posts by Locations",
    chartSubtitle: "Top 40",
    margin:        { top: 80, left: 40, bottom: 100, right: 20 }
});

// Creates the countries Histogram
var countriesHistogram = new Histogram({
    container:     "#analytics-chart-countries-by-frequency",
    identifier:    "countries",
    chartTitle:    "Job Posts by Countries",
    chartSubtitle: "EU Countries",
    margin:        { top: 80, left: 40, bottom: 100, right: 20 }
});
