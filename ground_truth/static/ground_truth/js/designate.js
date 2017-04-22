/**
 * @author Divya Sengar and John Purviance
 * Controls the designate screen
 * Refer to the Google Maps API
 */


///////////////////////////////////////////////
// investigation parameters

var sub_region_width = 0.003;
var sub_region_height = 0.003;
var num_sub_regions_width = 4;
var num_sub_regions_height = 4;
var zoom = 16;
///////////////////////////////////////////////

///////////////////////////////////////////////
// zoom parameters for allowing the expert to make decisions on regions
var zoom_threshold = zoom;
var can_decide = false;
///////////////////////////////////////////////

///////////////////////////////////////////////
// Worker pay and cost parameters
var max_cost = 100.00;

var worker_pay = 1.70;
var worker_density = 3;
///////////////////////////////////////////////

///////////////////////////////////////////////
// Map variables
var worker_subregions = {};
var map;
var investigation = null; // TODO this is the only investigation allowed and this is it.
///////////////////////////////////////////////

///////////////////////////////////////////////
// rectangle style templates

var sub_region_template = {
    strokeColor: 'white',
    strokeOpacity: 0.8,
    strokeWeight: 2
};

// used to modify selection and sub_region templates at high zoom levels
var high_zoom_template = {
    strokeOpacity: .8,
    strokeWeight: 3
};

// used to modify selection and sub_region templates at low zoom levels
var low_zoom_template = {
    strokeOpacity: 0.3,
    strokeWeight: 3
};

var selection_template = {
    strokeColor: '#0000FF',
    strokeOpacity: 0.5
};

var designate_template = {
    strokeColor: '#4682B4',
    strokeOpacity: 1,
    strokeWeight: 3,
    fillColor: '#4682B4',
    fillOpacity: 0.5,
    clickable: true
};

var too_expensive_template = {
    fillColor: "#ff343f",
    fillOpacity: 0.5,
    strokeColor: "#ff343f",
    strokeOpacity: 1,
    strokeWeight: 3
};

var not_seen_template = {
    fillColor: "#000000",
    fillOpacity: 1
};

var possible_template = {
    fillColor: "#000000",
    fillOpacity: 0
};

///////////////////////////////////////////////

// 3 TODO handle all view cases for overlap


function map_height() {
    // TODO never again google maps, you are hard
    var top_height = $("#nav").outerHeight(true);

    var bottom_height = 10;
    if ($("#judgement_wrapper").is(":visible")) {
        bottom_height = $("#judgement_wrapper").outerHeight(true);
    }
    var total = $(window).height();
    $("#mainView").height(total - top_height - bottom_height);
}

function can_afford(num_regions) {
    $("#cost").text("Total investigation cost: $" + (num_regions * worker_pay * worker_density).toFixed(2));
    return (num_regions * worker_pay * worker_density).toFixed(2) <= max_cost;

}

function zoom_tracker() {
    google.maps.event.addListener(map, "zoom_changed", function () {

        //TODO  this is not me being a bad dev, this is also a global used other places
        can_decide = map.getZoom() >= zoom_threshold;
        if (!can_decide) {
            Object.keys(worker_subregions).forEach(function (sub_key) {
                worker_subregions[sub_key].setOptions(sub_region_template);
                worker_subregions[sub_key].setOptions(high_zoom_template);
            });
        } else if (can_decide) {
            Object.keys(worker_subregions).forEach(function (sub_key) {
                worker_subregions[sub_key].setOptions(low_zoom_template);
            });
        }
    });
}

function sub_center_in_view(inner_rectangle, outer_rectangle) {

    var outer_bounds = outer_rectangle.getBounds();
    var inner_center = inner_rectangle.getBounds().getCenter();
    if (outer_bounds.getSouthWest().lng() <= inner_center.lng() && outer_bounds.getNorthEast().lng() >= inner_center.lng()) {
        if (outer_bounds.getSouthWest().lat() <= inner_center.lat() && outer_bounds.getNorthEast().lat() >= inner_center.lat()) {
            return true;
        }
    }
    return false;
}

function set_not_seen() {
    if ($("#judgement_wrapper").data("sub_region") !== undefined) {
        var sub_region = $("#judgement_wrapper").data("sub_region");
        sub_region["candidate"] = false;
        sub_region.setOptions(not_seen_template);
        selection_manager(sub_region);
    }
}

function unset_not_seen() {
    if ($("#judgement_wrapper").data("sub_region") !== undefined) {
        var sub_region = $("#judgement_wrapper").data("sub_region");
        sub_region["candidate"] = true;
        sub_region.setOptions(sub_region_template);
        sub_region.setOptions(selection_template);
        sub_region.setOptions(possible_template);
        selection_manager(sub_region);
    }
}

function selection_manager(sub_region) {
    if (sub_region === null) {
        $("#judgement_wrapper").removeData("sub_region");
        $('#not_seen').prop('disabled', true);
        $("#unset_not_seen").prop('disabled', true);
    } else if (sub_region["candidate"]) {
        $("#judgement_wrapper").data("sub_region", sub_region);
        $('#not_seen').prop('disabled', false);
        $("#unset_not_seen").prop('disabled', true);
    } else {
        $("#judgement_wrapper").data("sub_region", sub_region);
        $('#not_seen').prop('disabled', true);
        $("#unset_not_seen").prop('disabled', false);
    }
}

function view_tracker() {
    google.maps.event.addListener(map, "bounds_changed", function () {
        selection_manager(null);
        if (can_decide && Object.keys(worker_subregions).length > 0) {
            var in_view = [];
            Object.keys(worker_subregions).forEach(function (sub_key) {
                if (sub_center_in_view(worker_subregions[sub_key], map)) {
                    in_view.push(sub_key);
                }
            });
            if (in_view.length === 1) {

                console.log("we have only one sub region rectangle in the view");
                selection_template['zIndex'] = Object.keys(worker_subregions).length - 1;
                worker_subregions[in_view[0]].setOptions(selection_template);
                delete selection_template['zIndex'];
                selection_manager(worker_subregions[in_view[0]]);
            } else if (in_view.length === 0) {
                var sub_regions = Object.keys(worker_subregions);
                var i = -1;
                while (i+1 < sub_regions.length && !sub_center_in_view(map, worker_subregions[sub_regions[i+1]])) {
                    i++;
                }
                if (i+1 < sub_regions.length && i > -1) {
                    console.log("the view is inside a sub region");
                    selection_template['zIndex'] = Object.keys(worker_subregions).length - 1;
                    worker_subregions[sub_regions[i]].setOptions(selection_template);
                    delete selection_template['zIndex'];
                    selection_manager(worker_subregions[in_view[0]]);
                }
            } else {
                Object.keys(worker_subregions).forEach(function (sub_key) {
                    worker_subregions[sub_key].setOptions(sub_region_template);
                    worker_subregions[sub_key].setOptions(high_zoom_template);
                });
            }

        }
    });
}


$(document).ready(function () {
    map_height();
    $("#add_investigation").addClass("disabled");
    $(window).resize(map_height);
    $("#not_seen").click(set_not_seen);
    $("#unset_not_seen").click(unset_not_seen);
});


//Initialize the map and event handlers
function initMap() {
    //Create the map according to the API
    map = new google.maps.Map(document.getElementById('mainView'), {
        zoom: 11,
        center: {lat: 33.678, lng: -116.243},
        mapTypeId: 'satellite'
    });

    view_tracker();
    zoom_tracker();

    //Create the Drawing manager which will handle the designation
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
        drawingControl: false,
        map: map,
        rectangleOptions: designate_template
    });

    //Create the div's for the button
    var drawControlDiv = document.createElement('div');
    var drawControl = new draw_control_method(drawControlDiv, map);

    var eraseControlDiv = document.createElement('div');
    var eraseControl = new erase_control_method(eraseControlDiv, map);

    //Set them up onto the map
    drawControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(drawControlDiv);

    eraseControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(eraseControlDiv);

    //Add a listener for the drawing mode
    var draw_listener = google.maps.event.addDomListener(drawControlDiv, 'click', function () {
        //TODO set the drawingOptions here
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
    });

    // This is where we remove the one investigation
    var erase_listener = google.maps.event.addDomListener(eraseControlDiv, 'click', function () {
        if (investigation !== null) {
            $("#add_investigation").addClass("disabled");
            $("#too_much").attr("hidden", true);
            $("#cost").text("Total investigation cost: $0.00");
            investigation.setMap(null);
            investigation = null;
        }

    });

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
            'sub_region_width': sub_region_width,
            'sub_region_height': sub_region_height,
            'num_sub_regions_width': num_sub_regions_width,
            'num_sub_regions_height': num_sub_regions_height
        };

        $.post("/draw_investigation/", send, function (res) {
            var newSouthWest = new google.maps.LatLng(res.investigation_bounds.lat_start, res.investigation_bounds.lon_start);
            var newNorthEast = new google.maps.LatLng(res.investigation_bounds.lat_end, res.investigation_bounds.lon_end);
            rectangle.setBounds(new google.maps.LatLngBounds(newSouthWest, newNorthEast));

            investigation = rectangle;

            if (!can_afford(res["regions"].length)) {
                rectangle.setOptions(too_expensive_template);
                $("#add_investigation").addClass("disabled");
                $("#too_much").removeAttr("hidden");
            } else {

                $("#add_investigation").removeClass("disabled");
            }
        });
        drawingManager.setDrawingMode(null);
    });


    function send_investigation() {

        // This is where we stop people from spending too much money
        if (investigation == null || $("#add_investigation").hasClass("disabled")) {
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
            'sub_region_width': sub_region_width,
            'sub_region_height': sub_region_height,
            'num_sub_regions_width': num_sub_regions_width,
            'num_sub_regions_height': num_sub_regions_height,
            'description': $("#description").val(),
            'invest_name': $("#invest_name").val(),
            'zoom': zoom,
            'img': $("#img_url").val()
        };


        $.post("/add_investigation/", send, function (res) {

            // remove the drawing
            investigation.setMap(null);
            investigation = null;

            // Disable all ability to add another investigation
            drawingManager.setDrawingMode(null);
            google.maps.event.removeListener(erase_listener); // no more erasing
            google.maps.event.removeListener(draw_listener); // no more drawing

            for (var i = 0; i < res.sub_regions.length; i++) {

                var sub_region = res.sub_regions[i];
                var id = sub_region.id;
                worker_subregions[id] = new google.maps.Rectangle({
                    map: map,
                    bounds: {
                        north: Number(sub_region.lat_end),
                        south: Number(sub_region.lat_start),
                        east: Number(sub_region.lon_end),
                        west: Number(sub_region.lon_start)
                    }
                });
                worker_subregions[id].setOptions(sub_region_template);
                worker_subregions[id].setOptions({fillOpacity:0});
                worker_subregions[id]["candidate"] = true;


            }

            $("#judgement_wrapper").show();
            map_height();

            // setInterval(function () {
            //     var sub_regions = Object.keys(worker_subregions);
            //     for (var i = 0; i < sub_regions.length; i++) {
            //
            //         $.get("/judgement/" + sub_regions[i] + "/", function (res) {
            //             var region = worker_subregions[res["sub_region_id"]];
            //             if (res.status === "no") {
            //                 region.setOptions({fillColor: "#ff343f"});
            //             } else if (res.status === "yes") {
            //                 region.setOptions({fillColor: "#24d613"});
            //             } else {
            //                 region.setOptions({fillColor: "#ffffff"});
            //             }
            //
            //
            //         });
            //     }
            // }, 5000);


        });


    }

    $("#add_investigation").click(send_investigation);

    drawingManager.setDrawingMode(null);
}


function draw_control_method(controlDiv, map) {

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


function erase_control_method(controlDiv, map) {

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
