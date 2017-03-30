/**
 * @author Divya Sengar
 * Controls the designate screen
 * Refer to the Google Maps API
 */


//Control how big the rectangles are when designating
var WORKER_SIZE_WIDTH = 1000;
var WORKER_SIZE_HEIGHT = WORKER_SIZE_WIDTH;
///The map that is displayed on the page
var map;

//Initialize the map and event handlers
function initMap() {
    //Create the map according to the API
    map = new google.maps.Map(document.getElementById('mainView'), {
        zoom: 11,
        center: {lat: 33.678, lng: -116.243},
        mapTypeId: 'terrain'
    });

    //Create the Drawing manager which will handle the designation
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
        drawingControl: false,
        map: map,
        rectangleOptions: {
            strokeColor: '#4682B4',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#4682B4',
            fillOpacity: 0.35,
            clickable: true
        }
    });

    //Create the div's for the button
    var drawControlDiv = document.createElement('div');
    var drawControl = new drawControlMethod(drawControlDiv, map);

    var eraseControlDiv = document.createElement('div');
    var eraseControl = new eraseControlMethod(eraseControlDiv, map);

    //Set them up onto the map
    drawControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(drawControlDiv);

    eraseControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(eraseControlDiv);

    //Add a listener for the drawing mode
    google.maps.event.addDomListener(drawControlDiv, 'click', function () {
        //TODO set the drawingOptions here
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE)
    });

    //Handle the designated area being deleted
    var erase = false;
    google.maps.event.addDomListener(eraseControlDiv, 'click', function () {
        erase = true;
    });

    //Convert a drawn region into designated areas
    google.maps.event.addListener(drawingManager, 'rectanglecomplete', function (rectangle) {

        //Get the size and bounds of the drawn region
        var desigArea = rectangle.getBounds();

        var bottomLeft = desigArea.getSouthWest();
        console.log(bottomLeft.lat());
        console.log(bottomLeft.lng());
        var topRight = desigArea.getNorthEast();
        google.maps.event.addListener(rectangle, 'click', removeRegion);

        drawingManager.setDrawingMode(null);
    });
    //Remove region handler
    function removeRegion() {
        if (erase) {
            this.setMap(null);
            erase = false;
        }
    }

    drawingManager.setDrawingMode(null);
}


//Handle the page's layout dynamically  
function adjustStyle(width) {
    width = parseInt(width);
    if (width < 1000) {
        $("#size-stylesheet").attr("href", "designNarrow.css");
    } else {
        $("#size-stylesheet").attr("href", "designWide.css");
    }
}


//Set the css elements for the button
function drawControlMethod(controlDiv, map) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Draw a region';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Draw';
    controlUI.appendChild(controlText);
}


function eraseControlMethod(controlDiv, map) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Delete the Region';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Erase';
    controlUI.appendChild(controlText);
}

// //Utility function to convert bounds to coordinates
// //CW is a boolean value, true mean the returned coordinates should be clockwise
// function transBoundsToCord(bounds, CW) {
//     var NE = bounds.getNorthEast();
//     var SW = bounds.getSouthWest();
//     var SE = new google.maps.LatLng(SW.lat(), NE.lng());
//     var NW = new google.maps.LatLng(NE.lat(), SW.lng());
//
//     var path = [];
//
//     if (CW) {
//         path.push(NE);
//         path.push(SE);
//         path.push(SW);
//         path.push(NW);
//     }
//     else {
//         path.push(NE);
//         path.push(NW);
//         path.push(SW);
//         path.push(SE);
//     }
//
//     return path;
// }
