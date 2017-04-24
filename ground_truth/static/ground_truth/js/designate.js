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
var max_workers = 30.00;
var worker_density = 3;
///////////////////////////////////////////////

///////////////////////////////////////////////
// Map variables
var worker_subregions = {};
var map;
var canidates = 0;
///////////////////////////////////////////////

///////////////////////////////////////////////
// text templates
var start_drawing_template = "Draw Investigation";
var stop_drawing_template = "Disable Drawing";
var remove_drawing_template = "Remove Investigation";

var show_judgements_template = "Show All Suggestions";
var hide_judgements_template = "Hide All Suggestions";

var hide_overlays_template = "Hide All Overlays";
var show_overlays_template = "Show All Overlays";

var canidate_template = "Include in Search";
var not_canidate_template = "Exclude from Search";
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
    fillOpacity: 0.5
};

var possible_template = {
    fillColor: "#000000",
    fillOpacity: 0
};

/**
 * save the set styles for a sub_region
 * only backup strokeOpacity and fillOpacity, if you want more than set more
 * @param sub_region
 */
function backup_style(sub_region) {
    var properties = ["strokeOpacity", "fillOpacity"];
    var backup = {};
    for (var i = 0; i < properties.length; i++) {
        if (sub_region.hasOwnProperty(properties[i])) {
            backup[properties[i]] = sub_region[properties[i]];
        }
    }
    sub_region["style_backup"] = backup;
}

/**
 * revert the set styles for a sub_region
 * loops over the list of saved styles an reverts each of them.
 * @param sub_region
 */
function revert_style(sub_region) {
    for (var prop in sub_region["style_backup"]) {
        if (sub_region["style_backup"].hasOwnProperty(prop)) {
            var set = {};
            set[prop] = sub_region["style_backup"][prop];
            sub_region.setOptions(set);
        }
    }
    sub_region["style_backup"] = {};
}

/**
 * Set the styles of the map drawings based off zoom level
 */
function zoom_style_tracker() {
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

///////////////////////////////////////////////
///////////////////////////////////////////////
// set map height


function map_height() {
    // TODO never again google maps, you are hard
    var top_height = $("#nav").outerHeight(true);

    var bottom_height = 10;
    if ($("#judgement_wrapper").is(":visible")) {
        bottom_height = $("#judgement_wrapper").outerHeight(true);
    } else if ($("#drawing_wrapper").is(":visible")) {
        bottom_height = $("#drawing_wrapper").outerHeight(true);
    }
    var total = $(window).height();
    $("#mainView").height(total - top_height - bottom_height);
}

function can_afford(num_regions) {
    $("#cost").text("Workers required for investigation: " + (num_regions * worker_density));
    return (num_regions * worker_density) <= max_workers;

}

///////////////////////////////////////////////
///////////////////////////////////////////////
// Map placement logic

/**
 * Determines if inner_rectangle center is inside the outer rectangles center
 * @param inner_rectangle
 * @param outer_rectangle
 * @returns {boolean}
 */
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

///////////////////////////////////////////////

///////////////////////////////////////////////
// manage expert judements

// TODO i need to update the inits for these data bindings
// TODO i need to set the text on these buttons
function selection_manager(sub_region) {
    var toggle = $("#toggle_seen_btn");
    if (sub_region === null || sub_region === undefined) {
        toggle.removeData("sub_region");
        toggle.prop('disabled', true);
    } else {
        toggle.data("sub_region", sub_region);
        toggle.prop('disabled', false);
    }
}

function judge() {
    var toggle = $("#toggle_seen_btn");

    if (toggle.data("sub_region") === undefined || toggle.data("sub_region") === null) {
        toggle.prop('disabled', true);
    } else {
        if (toggle.data("sub_region")["candidate"]) {
            var sub_region = toggle.data("sub_region");
            sub_region["candidate"] = false;
            canidates++;
            judgements_manager();
            sub_region.setOptions(not_seen_template);
            selection_manager(sub_region);
            toggle.text(canidate_template)
        } else {
            var sub_region = toggle.data("sub_region");
            sub_region["candidate"] = true;
            canidates--;
            judgements_manager();
            sub_region.setOptions(sub_region_template);
            sub_region.setOptions(selection_template);
            sub_region.setOptions(possible_template);
            selection_manager(sub_region);
            toggle.text(not_canidate_template);
        }
    }
}

// function set_not_seen() {
//     if ($("#toggle_seen_btn").data("sub_region") !== undefined) {
//         var sub_region = $("#toggle_seen_btn").data("sub_region");
//         sub_region["candidate"] = false;
//         sub_region_candidates++;
//         judgements_manager();
//         sub_region.setOptions(not_seen_template);
//         selection_manager(sub_region);
//     }
// }

// function unset_not_seen() {
//     if ($("#judgement_wrapper").data("sub_region") !== undefined) {
//         var sub_region = $("#judgement_wrapper").data("sub_region");
//         sub_region["candidate"] = true;
//         sub_region_candidates--;
//         judgements_manager();
//         sub_region.setOptions(sub_region_template);
//         sub_region.setOptions(selection_template);
//         sub_region.setOptions(possible_template);
//         selection_manager(sub_region);
//     }
// }

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
                console.log("sub contained");
                selection_template['zIndex'] = Object.keys(worker_subregions).length - 1;
                worker_subregions[in_view[0]].setOptions(selection_template);
                delete selection_template['zIndex'];
                selection_manager(worker_subregions[in_view[0]]);
            } else if (in_view.length === 0) {
                var sub_regions = Object.keys(worker_subregions);
                var i = -1;
                while (i + 1 < sub_regions.length && !sub_center_in_view(map, worker_subregions[sub_regions[i + 1]])) {
                    i++;
                }
                if (i + 1 < sub_regions.length && i > -1) {
                    console.log("view contained");
                    selection_template['zIndex'] = Object.keys(worker_subregions).length - 1;
                    worker_subregions[sub_regions[i + 1]].setOptions(selection_template);
                    delete selection_template['zIndex'];
                    selection_manager(worker_subregions[sub_regions[i + 1]]);
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


///////////////////////////////////////////////
///////////////////////////////////////////////
// All polygon control
/**
 * Controls hiding and showing all expert, worker and grid polygons
 */
function toggle_overlay() {
    var toggle = $("#toggle_overlay_btn");
    if (!toggle.data("hidden")) {
        Object.keys(worker_subregions).forEach(function (id) {
            backup_style(worker_subregions[id]);
            worker_subregions[id].setOptions({fillOpacity: 0, strokeOpacity: 0});
        });
        toggle.data("hidden", true);
        toggle.text(show_overlays_template);
    } else {
        Object.keys(worker_subregions).forEach(function (id) {
            revert_style(worker_subregions[id]);
        });
        toggle.data("hidden", false);
        toggle.text(hide_overlays_template);
    }

}
///////////////////////////////////////////////
///////////////////////////////////////////////
// hid and show worker and expert judgements
function toggle_judgements() {
    var toggle = $("#toggle_judgements_btn");
    if (!toggle.data("hidden")) {
        Object.keys(worker_subregions).forEach(function (id) {
            backup_style(worker_subregions[id]);
            worker_subregions[id].setOptions({fillOpacity: 0});
        });
        toggle.data("hidden", true);
        toggle.text(show_judgements_template);
    } else {
        Object.keys(worker_subregions).forEach(function (id) {
            revert_style(worker_subregions[id]);
        });
        toggle.data("hidden", false);
        toggle.text(hide_judgements_template);
    }

}

function judgements_manager() {
    var toggle = $("#toggle_judgements_btn");
    if (canidates <= 0) {
        toggle.prop('disabled', true);
        toggle.text(hide_judgements_template);
    } else {
        toggle.prop('disabled', false);
        toggle.text(hide_judgements_template);
    }
}
///////////////////////////////////////////////
///////////////////////////////////////////////
$(document).ready(function () {

    $("#add_investigation").addClass("disabled");
    $(window).resize(map_height);

    var seen_btn = $("#toggle_seen_btn");
    seen_btn.click(judge);
    seen_btn.text(not_canidate_template);
    seen_btn.data("sub_region", null);


    // manage the showing and hiding of all map overlays.
    var overlay_btn = $("#toggle_overlay_btn");
    overlay_btn.click(toggle_overlay);
    overlay_btn.data("hidden", false);

    // manage showing and hiding all judgements (keep grid)
    var judgements_btn = $("#toggle_judgements_btn");
    judgements_btn.click(toggle_judgements);
    judgements_btn.data("hidden", true);

    $("#toggle_draw_erase_btn").text(start_drawing_template);
    judgements_btn.text(hide_judgements_template);
    overlay_btn.text(hide_overlays_template);
    map_height();
});
///////////////////////////////////////////////


//Initialize the map and event handlers
function initMap() {
    //Create the map according to the API
    map = new google.maps.Map(document.getElementById('mainView'), {
        zoom: 11,
        center: {lat: 33.678, lng: -116.243},
        mapTypeId: 'satellite',
        streetViewControl: false,
        draggable: true,
        scrollwheel: true,
        tilt: 0

    });

    view_tracker();
    zoom_style_tracker();

    //Create the Drawing manager which will handle the designation
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
        drawingControl: false,
        map: map,
        rectangleOptions: designate_template
    });


    function have_investigation() {
        var draw_erase_btn = $("#toggle_draw_erase_btn");
        return draw_erase_btn.data("investigation") !== null && draw_erase_btn.data("investigation") !== undefined;
    }

    function draw_erase() {
        var draw_erase_btn = $("#toggle_draw_erase_btn");

        // there is no investigation on the map
        if (!have_investigation()) {

            // not Drawing on the map yet
            if (drawingManager.getDrawingMode() === null || drawingManager.getDrawingMode() === undefined) {
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
                draw_erase_btn.text(stop_drawing_template);

            } else { // they are drawing on the map, they can disable it
                drawingManager.setDrawingMode(null);
                draw_erase_btn.text(start_drawing_template);
            }

        } else {
            $("#add_investigation").addClass("disabled");
            draw_erase_btn.text(start_drawing_template);
            $("#too_much").attr("hidden", true);
            $("#cost").text("Total investigation cost: $0.00");
            var invest = draw_erase_btn.data("investigation");
            invest.setMap(null);
            draw_erase_btn.data("investigation", null);
        }

    }


    // TODO i need to make a ready section where code goes when the init map stuff is done. the area where code actuallyexecutess
    $("#toggle_draw_erase_btn").click(draw_erase);
    $("#toggle_draw_erase_btn").data("investigation", null);

    //Convert a drawn region into designated areas
    google.maps.event.addListener(drawingManager, 'rectanglecomplete', function (rectangle) {
        var draw_erase_btn = $("#toggle_draw_erase_btn");
        draw_erase_btn.text(remove_drawing_template);

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

            draw_erase_btn.data("investigation", rectangle);

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
        if (!have_investigation()) {
            return
        }
        var draw_erase_btn = $("#toggle_draw_erase_btn");
        var investigation = draw_erase_btn.data("investigation");

        // This is where we stop people from spending too much money

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
            draw_erase_btn.data("investigation", investigation);

            // Disable all ability to add another investigation
            drawingManager.setDrawingMode(null);

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
                worker_subregions[id].setOptions({fillOpacity: 0});
                worker_subregions[id]["candidate"] = true;
                worker_subregions[id]["style_backup"] = {};
                backup_style(worker_subregions[id]);
            }

            $("#drawing_wrapper").hide();
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
