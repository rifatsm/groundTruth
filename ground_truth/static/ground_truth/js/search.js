/**
 * @author Divya Sengar
 * Controls the search screen
 * Refer to the Google Maps API
 */

//The map that is displayed on the page
var map;
var decisions = new Array();
var subRegions = new Array();
var regionNumber = 0;
var searchRegion;
var taskStartTime;
var lastTaskEndTime;
var highlightRegion;
var taskCode;
var yeses = 0;

//Initialize the map and event handlers
function initMap() {


    var br = ['br', './assets/Brasilia_level1_rotate.jpg', './assets/Brasilia_level2_rotate.jpg', './assets/Brasilia_level3_rotate.jpg', './assets/Brasilia_level4_rotate.jpg', './assets/Brasilia_level5_rotate.jpg', './assets/Brasilia_level6_rotate.jpg'];
    var clt = ['clt', './assets/CLT_level1_rotate.jpg', './assets/CLT_level2_rotate.jpg', './assets/CLT_level3_rotate.jpg', './assets/CLT_level4_rotate.jpg',];
    var cmd = ['cmd', './assets/Comodore_level1_rotate.jpg', './assets/Comodore_level2_rotate.jpg', './assets/Comodore_level3_rotate.jpg', './assets/Comodore_level4_rotate.jpg', './assets/Comodore_level5_rotate.jpg', './assets/Comodore_level6_rotate.jpg',];
    var sp = ['sp', './assets/Paulo_level1_rotate.jpg', './assets/Paulo_level2_rotate.jpg', './assets/Paulo_level3_rotate.jpg', './assets/Paulo_level4_rotate.jpg', './assets/Paulo_level5_rotate.jpg', './assets/Paulo_level6_rotate.jpg',];
    var p = ['p', './assets/Pope_level1_rotate.jpg', './assets/Pope_level2_rotate.jpg', './assets/Pope_level3_rotate.jpg'];

    var tasksList = [[br, 1], [br, 2], [br, 4], [br, 5], [br, 6],
        [clt, 1], [clt, 2], [clt, 4],
        [cmd, 1], [cmd, 2], [cmd, 4], [cmd, 5], [cmd, 6],
        [sp, 1], [sp, 2], [sp, 4], [sp, 5], [sp, 6],
        [p, 1], [p, 2], [p, 3]];

    var i = Math.floor(Math.random() * (4 - 0 + 1)) + 0;
    var baseTaskIndexer = [0, 5, 8, 13, 18, 20];
    var levelIndexer = baseTaskIndexer[i + 1] - baseTaskIndexer[i];
    var j = Math.floor(Math.random() * (levelIndexer - 1 + 1)) + 1;
    var taskID = baseTaskIndexer[i] + j;
    //var task = tasksList[taskID][0];
    //var level = tasksList[taskID][1];
    //taskCode = task[0] + level;
    var task = br;
    var level = 3;
    $('#mysteryImage').attr("src", task[level]);
    $('#taskID').text(taskCode);
    console.log(taskCode);


    taskStartTime = new Date();
    lastTaskEndTime = taskStartTime;
    var endTime = new Date(taskStartTime.getTime() + 10 * 60000); // 10 minutes

    function getTimeRemaining(endTime) {
        var t = Date.parse(endTime) - Date.parse(new Date());
        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        var days = Math.floor(t / (1000 * 60 * 60 * 24));
        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function getTimeElapsed(taskStartTime) {
        var t = Date.parse(new Date()) - Date.parse(taskStartTime);
        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        var days = Math.floor(t / (1000 * 60 * 60 * 24));
        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function initializeClock(id, endtime) {
        var clock = document.getElementById(id);
        var timeinterval = setInterval(function () {
            var remainingTime = getTimeRemaining(endtime);
            if (remainingTime.seconds < 10) {
                clock.innerHTML = 'Time Remaining ' + remainingTime.minutes + ':0' + remainingTime.seconds;
            }
            else {
                clock.innerHTML = 'Time Remaining ' + remainingTime.minutes + ':' + remainingTime.seconds;
            }
            if (remainingTime.total <= 0) {
                clearInterval(timeinterval);
                swal("Bummer!", "You ran out of time", "error")
            }
        }, 1000);
    }

    initializeClock('clockdiv', endTime);

    if (task == br) {
        miniMap = new google.maps.Map(document.getElementById('miniMap'), {
            zoom: 11,
            center: new google.maps.LatLng(-15.797342, -47.871063),
            mapTypeId: 'roadmap',
            disableDefaultUI: true,
            scrollwheel: true,
            draggable: true,
            zoomControl: true
        });

        searchRegion = new google.maps.Rectangle({
            strokeColor: '#000000',
            strokeOpacity: 0.8,
            strokeWeight: 5,
            fillColor: '#000000',
            fillOpacity: 0.0,
            map: miniMap,
            bounds: {
                north: -15.797342 + 0.01,
                south: -15.797342 - 0.01,
                east: -47.871063 + 0.01,
                west: -47.871063 - 0.01
            }
        });

        var SIZE = 5;
        var ZOOM = 17;
    } // end br
    else if (task == clt) {
        miniMap = new google.maps.Map(document.getElementById('miniMap'), {
            center: new google.maps.LatLng(35.225, -80.841437),
            zoom: 13,
            mapTypeId: 'roadmap',
            disableDefaultUI: true,
            scrollwheel: true,
            draggable: true,
            zoomControl: true
        });

        searchRegion = new google.maps.Rectangle({
            strokeColor: '#000000',
            strokeOpacity: 0.8,
            strokeWeight: 5,
            fillColor: '#000000',
            fillOpacity: 0.0,
            map: miniMap,
            bounds: {
                north: 35.225 + 0.01,
                south: 35.225 - 0.01,
                east: -80.841437 + 0.01,
                west: -80.841437 - 0.01
            }
        });

        var SIZE = 5;
        var ZOOM = 17;
    } // end clt
    else if (task == cmd) {

        miniMap = new google.maps.Map(document.getElementById('miniMap'), {
            center: new google.maps.LatLng(34.053287, -118.268999),
            zoom: 15,
            mapTypeId: 'roadmap',
            disableDefaultUI: true,
            scrollwheel: true,
            draggable: true,
            zoomControl: true
        });

        searchRegion = new google.maps.Rectangle({
            strokeColor: '#000000',
            strokeOpacity: 0.8,
            strokeWeight: 5,
            fillColor: '#000000',
            fillOpacity: 0.0,
            map: miniMap,
            bounds: {
                north: 34.053287 + 0.005,
                south: 34.053287 - 0.005,
                east: -118.268999 + 0.005,
                west: -118.268999 - 0.005
            }
        });

        var SIZE = 5;
        var ZOOM = 18;

    }// end cmd
    else if (task == p) {

        miniMap = new google.maps.Map(document.getElementById('miniMap'), {
            center: new google.maps.LatLng(41.692174, 44.804135),
            zoom: 16,
            mapTypeId: 'roadmap',
            disableDefaultUI: true,
            scrollwheel: true,
            draggable: true,
            zoomControl: true
        });

        searchRegion = new google.maps.Rectangle({
            strokeColor: '#000000',
            strokeOpacity: 0.8,
            strokeWeight: 5,
            fillColor: '#000000',
            fillOpacity: 0.0,
            map: miniMap,
            bounds: {
                north: 41.692174 + 0.0025,
                south: 41.692174 - 0.0025,
                east: 44.804135 + 0.0025,
                west: 44.804135 - 0.0025
            }
        });

        var SIZE = 5;
        var ZOOM = 19;

    }// end p
    else if (task == sp) {
        miniMap = new google.maps.Map(document.getElementById('miniMap'), {
            center: new google.maps.LatLng(-23.563, -46.655),
            zoom: 15,
            mapTypeId: 'roadmap',
            disableDefaultUI: true,
            scrollwheel: true,
            draggable: true,
            zoomControl: true
        });

        searchRegion = new google.maps.Rectangle({
            strokeColor: '#000000',
            strokeOpacity: 0.8,
            strokeWeight: 5,
            fillColor: '#000000',
            fillOpacity: 0.0,
            map: miniMap,
            bounds: {
                north: -23.563 + 0.0005,
                south: -23.563 - 0.005,
                east: -46.655 + 0.005,
                west: -46.655 - 0.005
            }
        });

        var SIZE = 5;
        var ZOOM = 18;

    }//end sp

    var searchWidth = searchRegion.getBounds().getNorthEast().lng() - searchRegion.getBounds().getSouthWest().lng();
    var searchHeight = searchRegion.getBounds().getNorthEast().lat() - searchRegion.getBounds().getSouthWest().lat();
    subRegionWidth = searchWidth / SIZE;
    subRegionHeight = searchHeight / SIZE;
    for (var i = SIZE; i > 0; i--) {
        if (i % 2 == 0) {
            for (var j = 1; j < SIZE + 1; j++) {
                var newLngNE = searchRegion.getBounds().getNorthEast().lng() - subRegionWidth * i;
                var newLatNE = searchRegion.getBounds().getNorthEast().lat() - subRegionHeight * j;
                var newLngSW = newLngNE + subRegionWidth;
                var newLatSW = newLatNE + subRegionHeight;
                var region = new google.maps.LatLngBounds(
                    new google.maps.LatLng(newLatNE, newLngNE),
                    new google.maps.LatLng(newLatSW, newLngSW)
                );

                subRegions.push(region);

                var subRegion = new google.maps.Rectangle({
                    strokeColor: 'gray',
                    strokeOpacity: 0.5,
                    strokeWeight: .5,
                    fillOpacity: 0.0,
                    map: miniMap,
                    bounds: region
                });
            }
        }
        else {
            for (var j = SIZE; j > 0; j--) {
                var newLngNE = searchRegion.getBounds().getNorthEast().lng() - subRegionWidth * i;
                var newLatNE = searchRegion.getBounds().getNorthEast().lat() - subRegionHeight * j;
                var newLngSW = newLngNE + subRegionWidth;
                var newLatSW = newLatNE + subRegionHeight;
                var region = new google.maps.LatLngBounds(
                    new google.maps.LatLng(newLatNE, newLngNE),
                    new google.maps.LatLng(newLatSW, newLngSW)
                );

                subRegions.push(region);

                var subRegion = new google.maps.Rectangle({
                    strokeColor: 'gray',
                    strokeOpacity: 0.5,
                    strokeWeight: .5,
                    fillOpacity: 0.0,
                    map: miniMap,
                    bounds: region
                });
            }
        }

    }


    map = new google.maps.Map(document.getElementById('mainView'), {
        tilt: 0,
        zoom: ZOOM,
        center: subRegions[regionNumber].getCenter(),
        mapTypeId: 'satellite',
        draggable: true,
        scrollwheel: true,
        minZoom: ZOOM,
        bounds: subRegions[regionNumber]

    });
    for (var i = 0; i < subRegions.length; i++) {
        var subRegionOutlines = new google.maps.Rectangle({
            strokeColor: 'white',
            strokeOpacity: 0.3,
            strokeWeight: 6,
            fillOpacity: 0.0,
            map: map,
            bounds: subRegions[i]
        });
    }
    highlightRegion = new google.maps.Rectangle({
        strokeColor: 'white',
        strokeOpacity: 0.4,
        strokeWeight: 15,
        fillOpacity: 0.0,
        map: map,
        bounds: subRegions[regionNumber]
    });


    //This rectangle is the red rectangle that appears in the minimap
    var historyBox = new google.maps.Rectangle({
        fillOpacity: 0,
        strokeColor: 'blue',
        map: miniMap
    });

    //Creates the div's for the buttons and adds them to the map
    var nextControlDiv = document.createElement('div');
    var nextControl = new nextControlMethod(nextControlDiv, map, 'Next');

    var yesControlDiv = document.createElement('div');
    var yesControl = new yesControlMethod(yesControlDiv, map);

    var noControlDiv = document.createElement('div');
    var noControl = new noControlMethod(noControlDiv, map);

    nextControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(nextControlDiv);

    yesControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(yesControlDiv);

    noControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(noControlDiv);


//Add an event listener to handle the tracking of the minimap
    google.maps.event.addListener(map, 'bounds_changed', (function () {
        //Get the bounds of the map, then set the bounds of the history box.
        var mapBounds = map.getBounds();

        historyBox.setBounds(mapBounds);

    }));

    //When the map is loaded in, then center the minimap.
    google.maps.event.addListenerOnce(map, 'tilesloaded', function () {
        miniMap.fitBounds(searchRegion.getBounds());
    });


    var decisionRectangle = null;
    //Handle the next button
    google.maps.event.addDomListener(nextControlDiv, 'click', nextFunction);

    function nextFunction() {

        console.log("SubRegion ID: " + regionNumber);
        console.log("Decision: " + decisionRectangle.yesNo);
        console.log("Time: " + getTimeElapsed(lastTaskEndTime).minutes + "m" + getTimeElapsed(lastTaskEndTime).seconds + "s");

        if (regionNumber == 0) {
            var send = {
                "time": getTimeElapsed(lastTaskEndTime).minutes * 60 + getTimeElapsed(lastTaskEndTime).seconds,
                "judgment": decisionRectangle.yesNo,
                "worker": 0,
                "index": regionNumber,
                "region_id": 2
            };
            $.post("/ground_truth/add/", send, function (res) {
                console.log(res);
            });
        }

        if (decisionRectangle.yesNo == 'yes') {
            yeses++;
        }

        lastTaskEndTime = new Date();
        if (regionNumber == subRegions.length - 1) {
            swal({
                title: "Thank you!",
                text: "You have now completed the task! </br>" + taskCode + "</br>Time to complete: " + getTimeElapsed(taskStartTime).minutes + "m" + getTimeElapsed(taskStartTime).seconds + "s",
                type: "success",
                html: true
            });
            console.log("Total Task Time: " + getTimeElapsed(taskStartTime).minutes + "m" + getTimeElapsed(taskStartTime).seconds + "s");
            console.log("Number Yes: " + yeses);
            console.log("Number No: " + (25 - yeses));

        }
        $("#nextButton").prop('disabled', true);
        highlightRegion.setMap(null);
        for (var i = 0; i < subRegions.length; i++) {
            var subRegionOutlines = new google.maps.Rectangle({
                strokeColor: 'white',
                strokeOpacity: 0.3,
                strokeWeight: 6,
                fillOpacity: 0.0,
                map: map,
                bounds: subRegions[i]
            });
        }
        highlightRegion = new google.maps.Rectangle({
            strokeColor: 'white',
            strokeOpacity: 0.4,
            strokeWeight: 15,
            fillOpacity: 0.0,
            map: map,
            bounds: subRegions[regionNumber + 1]
        });

        //TODO John: deicsionRectangle is an object that holds all the info for the region and the yes/no. Might also need subRegions[regionNumber].
        //This push call is simulating sending to db
        if (decisionRectangle != null) {
            decisions.push(decisionRectangle);
            regionNumber++;
            map.setCenter(subRegions[regionNumber].getCenter());
            for (var i = 0; i < decisions.length; i++) {
                decisions[i].setMap(miniMap);
            }
            decisionRectangle = null;
        }
        else {
            swal("Please make a decision", "Use the 'Yes/Maybe' or 'No' button to indication your response.", "warning");
        }

    }


    //Handle the no
    google.maps.event.addDomListener(noControlDiv, 'click', noFunction);

    function noFunction() {
        if (decisionRectangle != null) {
            decisionRectangle.setMap(null);
        }
        decisionRectangle = new google.maps.Rectangle({
            strokeColor: 'red',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: 'red',
            fillOpacity: 0.2,
            map: miniMap,
            value: 0,
            bounds: subRegions[regionNumber],
            yesNo: "no"
        });
        $("#nextButton").prop('disabled', false);

    }

//Add a listener to handle the mark history button being clicked
    google.maps.event.addDomListener(yesControlDiv, 'click', yesFunction);

    function yesFunction() {
        //Check if it's the right size, can be easily changed
        if (map.getZoom() < 17) {
            window.alert("You must be zoomed in further for your history to be tracked")
            return;
        }
        if (decisionRectangle != null) {
            decisionRectangle.setMap(null);
        }

        decisionRectangle = new google.maps.Rectangle({
            strokeColor: 'green',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: 'green',
            fillOpacity: 0.2,
            map: miniMap,
            value: 1,
            bounds: subRegions[regionNumber],
            yesNo: "yes"
        });
        $("#nextButton").prop('disabled', false);
    }

//Handle keyboard events
    google.maps.event.addDomListener(document, 'keyup', function (e) {

        var code = (e.keyCode ? e.keyCode : e.which);
        if (code === 78) {
            noFunction();
        }
        if (code === 89) {
            yesFunction();
        }
        if (code === 13) {
            nextFunction();
        }
    });

    var lastValidCenter = map.getCenter();

    google.maps.event.addListener(map, 'center_changed', function () {
        if (subRegions[regionNumber].contains(map.getCenter())) {
            // still within valid bounds, so save the last valid position
            lastValidCenter = map.getCenter();
            return;
        }
        //swal("Looks like your trying to explore outside of your region", "Please stay inside the bounds")
        // not valid anymore => return to last valid position
        map.panTo(lastValidCenter);
    });

    $('#rot-left').on('click', function (event) {
        event.preventDefault();
        $('#mysteryImage').rotate(-45);

    });

    $('#rot-right').on('click', function (event) {
        event.preventDefault();
        $('#mysteryImage').rotate(45);

    });
}

//These functions simply create the divs for the buttons on the map as well as the css vlaues.
function nextControlMethod(controlDiv, map, text) {
    var nextButton = document.createElement("input");
    nextButton.id = "nextButton"
    nextButton.style.marginTop = '10px';
    nextButton.style.marginRight = '10px';
    nextButton.type = "button";
    nextButton.name = "add";
    nextButton.value = text;
    nextButton.className = "btn btn-lg btn-primary";
    nextButton.disabled = true;
    controlDiv.appendChild(nextButton);
}


function noControlMethod(controlDiv, map) {
    var noButton = document.createElement("input");
    noButton.id = "noButton"
    noButton.style.marginTop = '10px';
    noButton.style.marginRight = '10px';
    noButton.type = "button";
    noButton.name = "add";
    noButton.value = "No";
    noButton.className = "btn btn-danger";
    controlDiv.appendChild(noButton);
}

function yesControlMethod(controlDiv, map) {
    var yesButton = document.createElement("input");
    yesButton.id = "yesButton"
    yesButton.style.marginTop = '10px';
    yesButton.style.marginRight = '10px';
    yesButton.type = "button";
    yesButton.name = "add";
    yesButton.value = "Yes / Maybe";
    yesButton.className = "btn btn-success";
    controlDiv.appendChild(yesButton);
}

//Translate the bounds to cordinates, CW is a boolean.
//If true, make the returned coordinates boolean.
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
	  
	  

