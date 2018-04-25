/**
 * @author Divya Sengar and John Purviance
 * Controls the designate screen
 * Refer to the Google Maps API
 */


///////////////////////////////////////////////
// investigation parameters

var sub_region_width = 0.005;
var sub_region_height = 0.005;
var num_sub_regions_width = 4;
var num_sub_regions_height = 4;
var zoom = 17;
///////////////////////////////////////////////

///////////////////////////////////////////////
// zoom parameters for allowing the expert to make decisions on regions
var zoom_threshold = zoom;
var can_decide = false;
///////////////////////////////////////////////

///////////////////////////////////////////////
// Worker pay and cost parameters
var max_workers = 50;
var worker_density = 3;
///////////////////////////////////////////////

///////////////////////////////////////////////
// Map variables
var worker_subregions = {};
var map;
var not_canidates = 0;
///////////////////////////////////////////////

///////////////////////////////////////////////
// text templates
var start_drawing_template = "Drawing Mode";
var stop_drawing_template = "Viewing Mode";
var remove_drawing_template = "Remove Search Space";

var show_judgements_template = "Show Color";
var hide_judgements_template = "Hide Color";

var hide_overlays_template = "Hide all Overlays";
var show_overlays_template = "Show all Overlays";

var canidate_template = "Include in Search";
var not_canidate_template = "Exclude from Search";

//var budeget_template = "You may use up to <strong>" + max_workers + "</strong> workers to complete your search space";
var budeget_template = "Total workers present ";
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
    strokeWeight: 2
};

// used to modify selection and sub_region templates at low zoom levels
var low_zoom_template = {
    strokeOpacity: 0.3,
    strokeWeight: 3
};

var selection_template = {
    strokeColor: '#0000FF',
    strokeOpacity: 0.8
};

var designate_template = {
    strokeColor: '#4682B4', //blue
    strokeOpacity: 1,
    strokeWeight: 3,
    fillColor: '#4682B4',  //blue
    fillOpacity: 0.5,
    clickable: true
};

var too_expensive_template = {
    fillColor: "#ff343f",  //red
    fillOpacity: 0.5,
    strokeColor: "#ff343f", //red
    strokeOpacity: 1,
    strokeWeight: 3
};

var not_seen_template = {
    fillColor: "#000000",
    fillOpacity: 0.6
};

var possible_template = {
    fillColor: "#000000",
    fillOpacity: 0
};

var nnn_temlate = {
    fillColor: "#d7191c",
    fillOpacity: 0.6
};

var yyy_template = {
    fillColor: "#1a9641",
    fillOpacity: 0.6 //0.7
};

var yyn_template = {
    fillColor: "#a6d96a",
    fillOpacity: 0.6 //0.5
};

var ynn_template = {
    fillColor: "#fdae61",
    fillOpacity: 0.6 //0.3
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
    sub_region["style_backup"].push(backup);
}

/**
 * revert the set styles for a sub_region
 * loops over the list of saved styles an reverts each of them.
 * @param sub_region
 */
function revert_style(sub_region) {
    if (sub_region["style_backup"].length <= 0) {
        var backup = sub_region_template; // TODO if the style is bad then look here
    } else {
        var backup = sub_region["style_backup"].pop();
    }

    for (var prop in backup) {
        if (backup.hasOwnProperty(prop)) {
            var set = {};
            set[prop] = backup[prop];
            sub_region.setOptions(set);
        }
    }
}

/**
 * Set the styles of the map drawings based off zoom level
 */
function zoom_style_tracker() {
    google.maps.event.addListener(map, "zoom_changed", function () {
        //TODO  this is not me being a bad dev, this is also a global used other places
        can_decide = map.getZoom() >= zoom_threshold;
    });
}

///////////////////////////////////////////////
///////////////////////////////////////////////
// query args
function getUrlVars() {
    // obtained from: http://stackoverflow.com/questions/4656843/jquery-get-querystring-from-url
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
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
    $("#cost").html(" Workers required for search space: ");
    $("#cost_2").html("<strong>" + (num_regions * worker_density)+"</strong>");
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
// hid and show worker and expert judgements

/**
 * handles users showing and hiding suggestions
 */
function toggle_suggestions() {
    var toggle = $("#toggle_suggestions_btn");
    if (!toggle.data("hidden")) { // suggestions are shown, we hide them now
        Object.keys(worker_subregions).forEach(function (id) { // set all suggestions centers to clear
            backup_style(worker_subregions[id]);
            worker_subregions[id].setOptions({fillOpacity: 0});
        });
        toggle.data("hidden", true); // update state to hidden (we flip states)
        toggle.text(show_judgements_template); // update text to show that we have flipped state
    } else { // suggestions are hidden now, we show them now
        Object.keys(worker_subregions).forEach(function (id) {

            revert_style(worker_subregions[id]); // update all suggestions back to the old style
        });
        toggle.data("hidden", false); // set button states back to showing everything.
        toggle.text(hide_judgements_template);

    }

    // reactivate judgement manager, it should active right back up if there was sub_region already in view.
    judgement_manager($("#toggle_seen_btn").data("sub_region"));

}

/**
 * activate or deactive the button based off of the global number of "not candidates"
 */
function suggestions_manager() {
    var toggle = $("#toggle_suggestions_btn");
    if (not_canidates <= 0) {
        toggle.prop('disabled', true);
    } else {
        toggle.prop('disabled', false);
    }
}
///////////////////////////////////////////////
///////////////////////////////////////////////
// manage expert judements

/**
 * manages if judgements should be allowed to be made based off of user state.
 * @param sub_region
 */
function judgement_manager(sub_region) {
    var toggle = $("#toggle_seen_btn");
    if (sub_region === null || sub_region === undefined) { // we want to disable the button
        toggle.removeData("sub_region");
        toggle.prop('disabled', true);
        $("#found_it_btn").prop("disabled", true);
    } else if ($("#toggle_overlay_btn").data("hidden")
        || $("#toggle_suggestions_btn").data("hidden")) { // should not be able to click in this state
        toggle.prop('disabled', true);
        $("#found_it_btn").prop("disabled", true);
    } else { // its clickable, let it flip states.
        if (sub_region["candidate"]) {
            toggle.text(not_canidate_template);
            $("#found_it_btn").prop("disabled", false);
        } else {
            toggle.text(canidate_template);
            $("#found_it_btn").prop("disabled", true);
        }
        toggle.data("sub_region", sub_region);
        toggle.prop('disabled', false);
    }
}

/**
 * toggles judgement of sub regions
 */
function judge() {
    var toggle = $("#toggle_seen_btn");
    var sub_region = toggle.data("sub_region");

    // no subregion selected, should never get here because of the management function
    if (toggle.data("sub_region") === undefined || toggle.data("sub_region") === null) {
        toggle.prop('disabled', true);
        $("#found_it_btn").prop("disabled", true);
        suggestions_manager(); // tell suggestions manager to turn itself off.
    } else {
        if (toggle.data("sub_region")["candidate"]) { // we are looking a sub_region that has not been outlawed

            sub_region["candidate"] = false; // its no good now
            not_canidates++;
            suggestions_manager(); // update sugestions since we have changed the nubmer of canidates.

            sub_region.setOptions(not_seen_template); // make it blacked out

            judgement_manager(sub_region); // TODO do i really need to call this here
            toggle.text(canidate_template)
        } else {
            sub_region["candidate"] = true;
            not_canidates--;
            suggestions_manager();
            sub_region.setOptions(sub_region_template);
            sub_region.setOptions(selection_template);
            sub_region.setOptions(possible_template);

            judgement_manager(sub_region); // TODO do i really need to call this here.
            toggle.text(not_canidate_template);
        }
    }

}

/**
 * set all sub_regions outlines back to the default
 */
function reset_outlines() {
    Object.keys(worker_subregions).forEach(function (key) {
        worker_subregions[key].setOptions(sub_region_template);
        worker_subregions[key].setOptions({"zIndex": 0});
    });
}

/**
 * update judgement function based off what is inside the map
 */
function view_tracker() {
    google.maps.event.addListener(map, "bounds_changed", function () {
        judgement_manager(null); // the map moved, we start from scratch
        if (can_decide && Object.keys(worker_subregions).length > 0) { // we are allowed to look for subregions and there are some
            var in_view = []; // how many sub_regions are in the map view
            Object.keys(worker_subregions).forEach(function (sub_key) {
                if (sub_center_in_view(worker_subregions[sub_key], map)) {
                    in_view.push(sub_key);
                }
            });
            if (in_view.length === 1) { // only one is in view, this must be the one

                // if the overlay button is selected then we should not work
                // TOdo is this the best way to do this? if not then why are we, if it is, then why are we not doing this
                // for the suggestions
                if (!$("#toggle_overlay_btn").data("hidden")) {
                    reset_outlines();
                    worker_subregions[in_view[0]].setOptions({"zIndex": Object.keys(worker_subregions).length + 1});
                    worker_subregions[in_view[0]].setOptions(selection_template);
                }

                judgement_manager(worker_subregions[in_view[0]]);
            } else if (in_view.length === 0) { // not are in view, check that we are zoomed in enough (too much)
                var sub_regions = Object.keys(worker_subregions);
                var i = -1;
                while (i + 1 < sub_regions.length && !sub_center_in_view(map, worker_subregions[sub_regions[i + 1]])) {
                    i++; // keep looking for sub_regions that we could be in
                }
                if (i + 1 < sub_regions.length && i > -1) {

                    // if the overlay button is selected then we should not work
                    // TOdo is this the best way to do this? if not then why are we, if it is, then why are we not doing this
                    // for the suggestions
                    if (!$("#toggle_overlay_btn").data("hidden")) {
                        reset_outlines();
                        worker_subregions[sub_regions[i + 1]].setOptions({"zIndex": Object.keys(worker_subregions).length + 1});
                        worker_subregions[sub_regions[i + 1]].setOptions(selection_template);
                    }
                    judgement_manager(worker_subregions[sub_regions[i + 1]]);
                }
            } else {
                // no acceptable sub region, we revert back if overlay is not selected.
                // TOdo is this the best way to do this? if not then why are we, if it is, then why are we not doing this
                // for the suggestions
                if (!$("#toggle_overlay_btn").data("hidden")) {
                    Object.keys(worker_subregions).forEach(function (sub_key) {
                        worker_subregions[sub_key].setOptions(sub_region_template);
                        worker_subregions[sub_key].setOptions(high_zoom_template);
                    });
                }

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

        console.log("since the overlay button is hidden we should never see this"); // TODO for debuging of hide color
        $("#toggle_suggestions_btn").prop("disabled", true);
        $("#toggle_seen_btn").prop("disabled", true);
        $("#found_it_btn").prop("disabled", true);

    } else {
        Object.keys(worker_subregions).forEach(function (id) {
            revert_style(worker_subregions[id]);
        });
        toggle.data("hidden", false);
        toggle.text(hide_overlays_template);
        reset_outlines();
        suggestions_manager();
        judgement_manager($("#toggle_seen_btn").data("sub_region"));

    }

}
///////////////////////////////////////////////
///////////////////////////////////////////////
// found it
function found_it() {

    swal({
            title: "Are you sure that you would like to end the search?",
            text: "Click yes to be taken to the solution of the search",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            closeOnConfirm: false
        },
        function () {
            var data_binding = $("#toggle_seen_btn");
            var sub_region = data_binding.data("sub_region");
            var url = "/foundit/?diagram_image=" + $("#diagram_image").attr("src") + "&ground_image=" + $("#ground_image").attr("src");
            url = url + "&lat=" + sub_region.getBounds().getCenter().lat();
            url = url + "&lon=" + sub_region.getBounds().getCenter().lng();
            window.location.href = url;
        });

}
///////////////////////////////////////////////
///////////////////////////////////////////////
//images 
function set_images() {
    var ground = "https://placeholdit.imgix.net/~text?txtsize=10&txt=ground+level+image+here&w=300&h=200&txttrack=0";
    var diagram = "https://placeholdit.imgix.net/~text?txtsize=13&txt=your+diagram+here&w=300&h=300&txttrack=0";

    var ground_image = getUrlVars()["ground_image"];
    var diagram_image = getUrlVars()["diagram_image"];
    if (ground_image === undefined || ground_image === null) {
        ground_image = ground;
    }
    if (diagram_image === undefined || diagram_image === null) {
        diagram_image = diagram;
    }
    $("#ground_image").attr("src", ground_image);
    $("#diagram_image").attr("src", diagram_image);
}
///////////////////////////////////////////////
///////////////////////////////////////////////

function is_tutorial() {
    var latitude = getUrlVars()["lat"];
    var longitude = getUrlVars()["lon"];
    var ground_image = getUrlVars()["ground_image"];
    var diagram_image = getUrlVars()["diagram_image"];
    var name = getUrlVars()["name"];

    if (latitude === null || latitude === undefined) {
        return true;
    }
    if (longitude === null || longitude === undefined) {
        return true;
    }

    if (name === undefined || name === null) {
        return true;
    }

    if (ground_image === undefined || ground_image === null) {
        return true;
    }
    if (diagram_image === undefined || diagram_image === null) {
        return true;
    }
    return false;
}
///////////////////////////////////////////////
///////////////////////////////////////////////
function worker_zoom() {
    $(".dropdown-menu label input").click(function () {
        zoom = parseInt($(this).attr("data-zoom"));
        sub_region_width = parseFloat($(this).attr("data-bounds"));
        $("#width_zoom_notifier").text($(this).attr("data-text"));
        sub_region_height = sub_region_width;

    });
}
///////////////////////////////////////////////
///////////////////////////////////////////////
// timer stuff

// function timer() {
//     // http://stackoverflow.com/questions/5517597/plain-count-up-timer-in-javascript
//
//     var hourLabel = document.getElementById("hours");
//     var minutesLabel = document.getElementById("minutes");
//     var secondsLabel = document.getElementById("seconds");
//     var totalSeconds = 0;
//     setInterval(setTime, 1000);
//
//     function setTime() {
//         ++totalSeconds;
//         secondsLabel.innerHTML = pad(totalSeconds % 60);
//         minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
//         hourLabel.innerHTML = pad(parseInt(totalSeconds / 3600));
//     }
//
//     function pad(val) {
//         var valString = val + "";
//         if (valString.length < 2) {
//             return "0" + valString;
//         }
//         else {
//             return valString;
//         }
//     }
// }

///////////////////////////////////////////////
///////////////////////////////////////////////
$(document).ready(function () {

    set_images();
    worker_zoom();

    $("#budget").html(budeget_template);
    $("#budget_2").html("<strong>" + max_workers+"</strong>");
    $("#description_form").hide();

    $("#add_investigation_btn").addClass("disabled");
    $(window).resize(map_height);

    var seen_btn = $("#toggle_seen_btn");
    seen_btn.click(judge);
    seen_btn.text(not_canidate_template);
    seen_btn.data("sub_region", null);


    $('#rot-left').on('click', function (event) {
        event.preventDefault();
        $('#diagram_image_4').rotate(-45);

    });
    $('#rot-right').on('click', function (event) {
        event.preventDefault();
        $('#diagram_image_4').rotate(45);

    });

    $("#found_it_btn").click(found_it);


    // manage the showing and hiding of all map overlays.
    // TODO not being used but its good to leave it here for now
    var overlay_btn = $("#toggle_overlay_btn");
    overlay_btn.click(toggle_overlay);
    overlay_btn.data("hidden", false);

    // manage showing and hiding all judgements (keep grid)
    var judgements_btn = $("#toggle_suggestions_btn");
    judgements_btn.click(toggle_suggestions);
    judgements_btn.data("hidden", false);

    $("#toggle_draw_erase_btn").text(start_drawing_template);
    judgements_btn.text(hide_judgements_template);
    overlay_btn.text(hide_overlays_template);
    map_height();
});
///////////////////////////////////////////////


//Initialize the map and event handlers
function initMap() {
    //Create the map according to the API

    var latitude = getUrlVars()["lat"];
    var longitude = getUrlVars()["lon"];


    if (latitude === null || latitude === undefined) {
        latitude = 33.678;
    }
    if (longitude === null || longitude === undefined) {
        longitude = -116.243;
    }

    if (typeof latitude === "string") {
        latitude = parseFloat(latitude)
    }

    if (typeof longitude === "string") {
        longitude = parseFloat(longitude)
    }

    map = new google.maps.Map(document.getElementById('mainView'), {
        zoom: 12,
        center: {lat: latitude, lng: longitude},
        mapTypeId: 'satellite',
        draggable: true,
        scrollwheel: true,
        streetViewControl: false,
        scaleControl: true,
        tilt: 0

    });


    view_tracker();
    zoom_style_tracker();


    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
//    console.log(searchBox);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
      console.log("inside listener");
      console.log("map: "+map.getBounds());
      console.log("searchBox: "+searchBox);
      var test = searchBox.setBounds(map.getBounds());
      console.log("test: "+test);
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }
    // Clear out the old markers.
      markers.forEach(function(marker) {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();
      places.forEach(function(place) {
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }
        var icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        // Create a marker for each place.
        markers.push(new google.maps.Marker({
          map: map,
          icon: icon,
          title: place.name,
          position: place.geometry.location
        }));

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });

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
            $("#add_investigation_btn").removeClass("btn-success");
            $("#add_investigation_btn").addClass("btn-default");

            // not Drawing on the map yet
            if (drawingManager.getDrawingMode() === null || drawingManager.getDrawingMode() === undefined) {
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
                draw_erase_btn.text(stop_drawing_template);
                draw_erase_btn.removeClass("btn-primary");
                draw_erase_btn.removeClass("btn-danger");
                draw_erase_btn.removeClass("btn-success");
                draw_erase_btn.addClass("btn-default");
                $("#width_zoom").hide();
                $("#width_zoom_notifier").show();
                map_height();


            } else { // they are drawing on the map, they can disable it
                drawingManager.setDrawingMode(null);
                draw_erase_btn.text(start_drawing_template);
                draw_erase_btn.removeClass("btn-primary");
                draw_erase_btn.removeClass("btn-danger");
                draw_erase_btn.removeClass("btn-default");
                draw_erase_btn.addClass("btn-success");
//                $("#width_zoom").show();
                $("#width_zoom_notifier").hide();
                map_height();
            }

        } else {
            $("#add_investigation_btn").addClass("disabled");
            draw_erase_btn.text(start_drawing_template);
            $("#add_investigation_btn").removeClass("btn-success");
            $("#add_investigation_btn").addClass("btn-default");
            draw_erase_btn.removeClass("btn-primary");
            draw_erase_btn.removeClass("btn-danger");
            draw_erase_btn.removeClass("btn-default");
            draw_erase_btn.addClass("btn-success");
//            $("#width_zoom").show();
            $("#width_zoom_notifier").hide();
            map_height();

            $("#too_much").attr("hidden", true);
            $("#cost").text(" Workers required for search space: ");
            $("#cost_2").text("0");
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
        draw_erase_btn.removeClass("btn-success");
        draw_erase_btn.removeClass("btn-danger");
        draw_erase_btn.removeClass("btn-default");
//        draw_erase_btn.addClass("btn-primary");
        draw_erase_btn.addClass("btn-danger");
        $("#width_zoom").hide();
        $("#width_zoom_notifier").show();

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


            var add_investigation = $("#add_investigation_btn");
            if (!can_afford(res["regions"].length)) {
                rectangle.setOptions(too_expensive_template);

                add_investigation.addClass("disabled");
                add_investigation.prop("disabled", true);
                $("#too_much").removeAttr("hidden");

                draw_erase_btn.removeClass("btn-primary");
                draw_erase_btn.removeClass("btn-default");
                draw_erase_btn.addClass("btn-danger");
            } else {

                add_investigation.removeClass("disabled");
                add_investigation.prop("disabled", false);
                add_investigation.addClass("btn-success");

            }
        });
        drawingManager.setDrawingMode(null);

    });


    function send_investigation() {
        if (!have_investigation()) {
            return
        }
        $("#add_investigation_btn").hide();
        $("#define_title").hide();
        $("#budget").hide();
        $("#budget_2").hide();
        $("#cost").hide();
        $("#cost_2").hide();

        $("#crowd_title").show();
//        $("#legend").show();
        $("#legend").removeAttr("hidden");
        $("#legend_h").removeAttr("hidden");

        var draw_erase_btn = $("#toggle_draw_erase_btn");
        var investigation = draw_erase_btn.data("investigation");

        // This is where we stop people from spending too much money

        var investigation_area = investigation.getBounds();

        var bottomLeft = investigation_area.getSouthWest();
        var topRight = investigation_area.getNorthEast();


        var name = getUrlVars()["name"];
        if (name === undefined || undefined === null) {
            name = "Tutorial Investigation";
        }

        var send = {
            'lat_start': bottomLeft.lat(),
            'lon_start': bottomLeft.lng(),
            'lat_end': topRight.lat(),
            'lon_end': topRight.lng(),
            'sub_region_width': sub_region_width,
            'sub_region_height': sub_region_height,
            'num_sub_regions_width': num_sub_regions_width,
            'num_sub_regions_height': num_sub_regions_height,
            'invest_name': name,
            'zoom': zoom,
            'ground_image': $('#ground_image_1').attr('src'),
            'diagram_image': $('#diagram_image_1').attr('src'),
            // "diagram_image": getUrlVars()["diagram_image"], // TODO Because the rotation of the images messes with things
            'is_tutorial': is_tutorial()
        };


        $.post("/add_investigation/", send, function (res) {

            //timer();
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
                worker_subregions[id]["style_backup"] = [];
                backup_style(worker_subregions[id]);
            }

            $("#drawing_wrapper").hide();
            $("#judgement_wrapper").show();
            $("#toggle_overlay_btn").hide();
            map_height();

            console.log("Tutorial: "+is_tutorial);

//            if (!is_tutorial() ) {
            if (true) {
                setInterval(function () {
                    var sub_regions = Object.keys(worker_subregions);
                    for (var i = 0; i < sub_regions.length; i++) {

                        $.get("/judgement/" + sub_regions[i] + "/", function (res) {
                            var region = worker_subregions[res["sub_region_id"]];
                            if (region["candidate"] && !$("#toggle_overlay_btn").data("hidden") && !$("#toggle_suggestions_btn").data("hidden")) {
                                if (res.status >= 3) {
                                    region.setOptions(yyy_template);
                                } else if (res.status === 2) {
                                    region.setOptions(yyn_template);
                                } else if (res.status === 1) {
                                    region.setOptions(ynn_template);
                                } else if (res.status === 0) {
                                    region.setOptions(nnn_temlate);
                                }
                            }

                        });
                    }
                }, 5000);
            }

        });


    }

    $("#add_investigation_btn").click(send_investigation);

    drawingManager.setDrawingMode(null);
}
