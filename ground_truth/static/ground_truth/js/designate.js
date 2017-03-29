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
        console.log("JOHN!!!!!! " + desigArea); // TODO look here
        var bottomLeft = desigArea.getSouthWest();
        var topRight = desigArea.getNorthEast();
        var bottomRight = new google.maps.LatLng(bottomLeft.lat(), topRight.lng());

        var width = google.maps.geometry.spherical.computeDistanceBetween(bottomLeft, bottomRight);
        var height = google.maps.geometry.spherical.computeDistanceBetween(bottomRight, topRight);

        var area = google.maps.geometry.spherical.computeArea(transBoundsToCord(desigArea, true));
        //Now that we have all the relevant info, delete the drawn region
        rectangle.setMap(null);
        //Simply generate the designated regions
        for (var i = 0; i < Math.floor(width / WORKER_SIZE_WIDTH); i++) {
            for (var j = 0; j < Math.floor(height / WORKER_SIZE_HEIGHT); j++) {
                //Use this generate the bounds for the designated region
                var SWLat = google.maps.geometry.spherical.computeOffset(bottomLeft, j * WORKER_SIZE_HEIGHT, 0).lat();
                var SWLong = google.maps.geometry.spherical.computeOffset(bottomLeft, i * WORKER_SIZE_WIDTH, 90).lng();

                var newSouthWest = new google.maps.LatLng(SWLat, SWLong);

                //If the blocks do not perfectly fit in the drawn region, extend it to fit the region.
                var NELat;
                var NELong;
                if (j == Math.floor(height / WORKER_SIZE_HEIGHT) - 1) {
                    NELat = google.maps.geometry.spherical.computeOffset(bottomLeft, (j + 1) * WORKER_SIZE_HEIGHT + height % WORKER_SIZE_HEIGHT, 0).lat();
                }
                else {
                    NELat = google.maps.geometry.spherical.computeOffset(bottomLeft, (j + 1) * WORKER_SIZE_HEIGHT, 0).lat();
                }

                if (i == Math.floor(width / WORKER_SIZE_WIDTH) - 1) {
                    NELong = google.maps.geometry.spherical.computeOffset(bottomLeft, (i + 1) * WORKER_SIZE_WIDTH + width % WORKER_SIZE_WIDTH, 90).lng();

                } else {
                    NELong = google.maps.geometry.spherical.computeOffset(bottomLeft, (i + 1) * WORKER_SIZE_WIDTH, 90).lng();
                }
                var newNorthEast = new google.maps.LatLng(NELat, NELong);
                console.log(this.worker);

                var colorList = ['red', 'red', 'red', 'red', 'red', 'green'];
                //Generate the rectangle, with the options set below
                var tempRectangle = new google.maps.Rectangle({
                    map: map,
                    strokeColor: 'black',
                    strokeOpacity: 0.8,
                    strokeWeight: .5,
                    fillColor: colorList[Math.floor(Math.random() * 6)], // based on findings
                    fillOpacity: (10 + Math.floor((Math.random() * 75))) / 100, //based on progress
                    clickable: true,
                    bounds: new google.maps.LatLngBounds(newSouthWest, newNorthEast)
                });

                //Demonstrate that one can add values to the rectangle
                //Potentially add it to a list, send it to the backend, would be done here
                tempRectangle["worker"] = Math.floor(Math.random() * 20);
                google.maps.event.addListener(tempRectangle, 'click', removeRegion);
                google.maps.event.addListener(tempRectangle, 'mouseover', showWorkers);
                google.maps.event.addListener(tempRectangle, 'mouseout', hideWorkers);


            }
        }

        drawingManager.setDrawingMode(null);
    });
    //Remove region handler
    function removeRegion() {
        if (erase) {
            hideWorkers();
            this.setMap(null);
            erase = false;
        }
    }

    //Show worker handler
    function showWorkers() {
        $("#workerText").text(this.worker);
    }

    //Hide worker handler
    function hideWorkers() {
        $("#workerText").text("Hover over designated region to find out");
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


// TODO this code was causing loading issues. turn on only if you can fix it
// $(function() {
//   adjustStyle($(this).width());
//   $(window).resize(function() {
//     adjustStyle($(this).width());
//   });
// });


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

//Utility function to convert bounds to coordinates
//CW is a boolean value, true mean the returned coordinates should be clockwise
function transBoundsToCord(bounds, CW) {
    var NE = bounds.getNorthEast();
    var SW = bounds.getSouthWest();
    var SE = new google.maps.LatLng(SW.lat(), NE.lng());
    var NW = new google.maps.LatLng(NE.lat(), SW.lng());

    var path = [];

    if (CW) {
        path.push(NE);
        path.push(SE);
        path.push(SW);
        path.push(NW);
    }
    else {
        path.push(NE);
        path.push(NW);
        path.push(SW);
        path.push(SE);
    }

    return path;
}
