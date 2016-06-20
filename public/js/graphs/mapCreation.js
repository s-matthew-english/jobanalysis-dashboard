/**
 * Creates the Europe map and and draws the map.
 */ 

// create the map and draw's it
var europe = new EuropeMap({
    mapContainer: "#map-container",
    timelineContainer: "#timeline-container",
    infoContainer: "#info-container"
});
europe.DrawMap();