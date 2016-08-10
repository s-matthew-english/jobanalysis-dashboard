/*
 * Saves the SVG as a .png file. It is then sent to the client via browser.
 */
function getPNGfromSVG() {
    saveSvgAsPng(document.getElementById("map-europe"), "map.png", {
        backgroundColor: "#FFFFFF",
        encoderOptions: 0.8
    });
}
