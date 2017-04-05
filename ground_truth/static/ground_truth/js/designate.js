/**
 * @author Divya Sengar and John Purviance
 * Controls the designate screen
 * Refer to the Google Maps API
 */


///The map that is displayed on the page
var map;

var investigation = null; // TODO this is the only investigation allowed and this is it.

function map_height() {
    // TODO never again google maps, you are hard
    var top_height = $("#nav").outerHeight(true);
    var total = $(window).height();
    $("#mainView").height(total - top_height);
}

$( document ).ready(function() {
    map_height();
    $( window ).resize(map_height);
});


// TODO all the other functions should be declared and implemented above the initMap

function send_investigation() {
    if (investigation === null) {
        return;
    }

    var investigation_area = investigation.getBounds();

    var bottomLeft = investigation_area.getSouthWest();
    var topRight = investigation_area.getNorthEast();

    var send = {
        'lat_start': bottomLeft.lat(),
        'lon_start': bottomLeft.lng(),
        'lat_end': topRight.lat(),
        'lon_end': topRight.lng(),
        'sub_region_width': $("#sub_region_width").find(":selected").val(),
        'sub_region_height': $("#sub_region_height").find(":selected").val(),
        'num_sub_regions_width': $("#num_sub_regions_width").find(":selected").val(),
        'num_sub_regions_height': $("#num_sub_regions_height").find(":selected").val(),
        'description': $("#description").val(),
        'invest_name': $("#invest_name").val(),
        'expert_id': $("#ID").val(),
        'zoom': $("#zoom").val(),
        'img': $("#img_url").val(),
        'is_dropbox': document.getElementById('is_dropbox').checked
    };


    $.post("/add_investigation/", send, function (res) {
        console.log(res);
    });


}


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

    // This is where we remove the one investigation
    google.maps.event.addDomListener(eraseControlDiv, 'click', function () {
        if (investigation !== null) {
            investigation.setMap(null);
            investigation = null;
        }

    });

    $("#add_investigation").click(send_investigation);

    //Convert a drawn region into designated areas
    google.maps.event.addListener(drawingManager, 'rectanglecomplete', function (rectangle) {

        if (investigation != null) {
            return; // TODO they should not be allowed to have multiple drawn regions.
        }

        //Get the size and bounds of the drawn region
        var desigArea = rectangle.getBounds();

        var bottomLeft = desigArea.getSouthWest();
        var topRight = desigArea.getNorthEast();

        var send = {
            'lat_start': bottomLeft.lat(),
            'lon_start': bottomLeft.lng(),
            'lat_end': topRight.lat(),
            'lon_end': topRight.lng(),
            'sub_region_width': $("#sub_region_width").find(":selected").text(),
            'sub_region_height': $("#sub_region_height").find(":selected").text(),
            'num_sub_regions_width': $("#num_sub_regions_width").find(":selected").text(),
            'num_sub_regions_height': $("#num_sub_regions_height").find(":selected").text()
        };

        $.post("/draw_investigation/", send, function (res) {
            var newSouthWest = new google.maps.LatLng(res.investigation_bounds.lat_start, res.investigation_bounds.lon_start);
            var newNorthEast = new google.maps.LatLng(res.investigation_bounds.lat_end, res.investigation_bounds.lon_end);
            rectangle.setBounds(new google.maps.LatLngBounds(newSouthWest, newNorthEast));

            investigation = rectangle;
        });

        drawingManager.setDrawingMode(null);
    });


    drawingManager.setDrawingMode(null);
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
