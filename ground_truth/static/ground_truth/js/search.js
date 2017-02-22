/**
 * @author Divya Sengar
 * Controls the search screen
 * Refer to the Google Maps API
 */

//The map that is displayed on the page
var map;
var judgementsList = new Array();
var subRegionsList = new Array();
var currentSubRegionNumber = 0;
var searchRegion;
var taskStartTime;
var lastTaskEndTime;
var highlightSubRegion;
var taskCode;
var yeses = 0;

var db = false;

//Initialize the map and event handlers
function initMap() {

    //----Set up study info-----
    //STUDY ONLY
    var br = ['br', './assets/Brasilia_level1_rotate.jpg', './assets/Brasilia_level2_rotate.jpg', './assets/Brasilia_level3_rotate.jpg', './assets/Brasilia_level4_rotate.jpg', './assets/Brasilia_level5_rotate.jpg', './assets/Brasilia_level6_rotate.jpg'];
    var clt = ['clt', './assets/CLT_level1_rotate.jpg', './assets/CLT_level2_rotate.jpg', './assets/CLT_level3_rotate.jpg', './assets/CLT_level4_rotate.jpg',];
    var cmd = ['cmd', './assets/Comodore_level1_rotate.jpg', './assets/Comodore_level2_rotate.jpg', './assets/Comodore_level3_rotate.jpg', './assets/Comodore_level4_rotate.jpg', './assets/Comodore_level5_rotate.jpg', './assets/Comodore_level6_rotate.jpg'];
    var sp = ['sp', './assets/Paulo_level1_rotate.jpg', './assets/Paulo_level2_rotate.jpg', './assets/Paulo_level3_rotate.jpg', './assets/Paulo_level4_rotate.jpg', './assets/Paulo_level5_rotate.jpg', './assets/Paulo_level6_rotate.jpg'];
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
    var task = br;
    var level = 3;
    taskCode = task[0] + level;
    $('#mysteryImage').attr("src", task[level]);
    $('#taskID').text(taskCode);
    console.log(taskCode);


    //----Timer----
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


    //----Initialize different maps for the different task codes----
    //STUDY ONLY
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
    //end initialization of separate maps for the study





    //----Process the larger region into subregions, store subregions in subRegionsList, and draw----

    var json = {"sub_regions": [{"index": 0, "region_id": "1", "bounds": {"lat_end": -15.803342, "lon_start": -47.881063, "lon_end": -47.877063, "lat_start": -15.807342}}, {"index": 1, "region_id": "1", "bounds": {"lat_end": -15.803342, "lon_start": -47.877063, "lon_end": -47.873063, "lat_start": -15.807342}}, {"index": 2, "region_id": "1", "bounds": {"lat_end": -15.803342, "lon_start": -47.873063, "lon_end": -47.869063, "lat_start": -15.807342}}, {"index": 3, "region_id": "1", "bounds": {"lat_end": -15.803342, "lon_start": -47.869063, "lon_end": -47.865063, "lat_start": -15.807342}}, {"index": 4, "region_id": "1", "bounds": {"lat_end": -15.803342, "lon_start": -47.865063, "lon_end": -47.861063, "lat_start": -15.807342}}, {"index": 5, "region_id": "1", "bounds": {"lat_end": -15.799342, "lon_start": -47.881063, "lon_end": -47.877063, "lat_start": -15.803342}}, {"index": 6, "region_id": "1", "bounds": {"lat_end": -15.799342, "lon_start": -47.877063, "lon_end": -47.873063, "lat_start": -15.803342}}, {"index": 7, "region_id": "1", "bounds": {"lat_end": -15.799342, "lon_start": -47.873063, "lon_end": -47.869063, "lat_start": -15.803342}}, {"index": 8, "region_id": "1", "bounds": {"lat_end": -15.799342, "lon_start": -47.869063, "lon_end": -47.865063, "lat_start": -15.803342}}, {"index": 9, "region_id": "1", "bounds": {"lat_end": -15.799342, "lon_start": -47.865063, "lon_end": -47.861063, "lat_start": -15.803342}}, {"index": 10, "region_id": "1", "bounds": {"lat_end": -15.795342, "lon_start": -47.881063, "lon_end": -47.877063, "lat_start": -15.799342}}, {"index": 11, "region_id": "1", "bounds": {"lat_end": -15.795342, "lon_start": -47.877063, "lon_end": -47.873063, "lat_start": -15.799342}}, {"index": 12, "region_id": "1", "bounds": {"lat_end": -15.795342, "lon_start": -47.873063, "lon_end": -47.869063, "lat_start": -15.799342}}, {"index": 13, "region_id": "1", "bounds": {"lat_end": -15.795342, "lon_start": -47.869063, "lon_end": -47.865063, "lat_start": -15.799342}}, {"index": 14, "region_id": "1", "bounds": {"lat_end": -15.795342, "lon_start": -47.865063, "lon_end": -47.861063, "lat_start": -15.799342}}, {"index": 15, "region_id": "1", "bounds": {"lat_end": -15.791342, "lon_start": -47.881063, "lon_end": -47.877063, "lat_start": -15.795342}}, {"index": 16, "region_id": "1", "bounds": {"lat_end": -15.791342, "lon_start": -47.877063, "lon_end": -47.873063, "lat_start": -15.795342}}, {"index": 17, "region_id": "1", "bounds": {"lat_end": -15.791342, "lon_start": -47.873063, "lon_end": -47.869063, "lat_start": -15.795342}}, {"index": 18, "region_id": "1", "bounds": {"lat_end": -15.791342, "lon_start": -47.869063, "lon_end": -47.865063, "lat_start": -15.795342}}, {"index": 19, "region_id": "1", "bounds": {"lat_end": -15.791342, "lon_start": -47.865063, "lon_end": -47.861063, "lat_start": -15.795342}}, {"index": 20, "region_id": "1", "bounds": {"lat_end": -15.787342, "lon_start": -47.881063, "lon_end": -47.877063, "lat_start": -15.791342}}, {"index": 21, "region_id": "1", "bounds": {"lat_end": -15.787342, "lon_start": -47.877063, "lon_end": -47.873063, "lat_start": -15.791342}}, {"index": 22, "region_id": "1", "bounds": {"lat_end": -15.787342, "lon_start": -47.873063, "lon_end": -47.869063, "lat_start": -15.791342}}, {"index": 23, "region_id": "1", "bounds": {"lat_end": -15.787342, "lon_start": -47.869063, "lon_end": -47.865063, "lat_start": -15.791342}}, {"index": 24, "region_id": "1", "bounds": {"lat_end": -15.787342, "lon_start": -47.865063, "lon_end": -47.861063, "lat_start": -15.791342}}], "id": "1", "investigation_id": 1, "bounds": {"lat_end": -15.787342, "lon_start": -47.881063, "lon_end": -47.861063, "lat_start": -15.807342}}


    var regionWidth = searchRegion.getBounds().getNorthEast().lng() - searchRegion.getBounds().getSouthWest().lng();
    var regionHeight = searchRegion.getBounds().getNorthEast().lat() - searchRegion.getBounds().getSouthWest().lat();
    //TODO Currently size is definied per task. Later needs to be a constant
    subRegionWidth = regionWidth / SIZE;
    subRegionHeight = regionHeight / SIZE;

    //Construct the subregions in the creeping line search pattern
    //Starting with bottom left i.e. SW corner
    for(var i=0; i<json.sub_regions.length; i++){
        var s = json.sub_regions[i].bounds;
        var subRegionBounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng(s.lat_start, s.lon_start),
                    new google.maps.LatLng(s.lat_end, s.lon_end)
                );
        subRegionsList.push(subRegionBounds);
    }

    //Draw the subregions on the miniMap
    for (var i = 0; i < subRegionsList.length; i++) {
        var subRegion = new google.maps.Rectangle({
                    strokeColor: 'gray',
                    strokeOpacity: 0.5,
                    strokeWeight: .5,
                    fillOpacity: 0.0,
                    map: miniMap,
                    bounds: subRegionsList[i]
                });
    }


    // Initializes the main search map to subregion 0.
    map = new google.maps.Map(document.getElementById('mainView'), {
        tilt: 0,
        zoom: ZOOM,
        center: subRegionsList[currentSubRegionNumber].getCenter(),
        mapTypeId: 'satellite',
        draggable: true,
        scrollwheel: true,
        minZoom: ZOOM,
        bounds: subRegionsList[currentSubRegionNumber]

    });

    //Draw the subregions on the main map
    for (var i = 0; i < subRegionsList.length; i++) {
        var subRegionOutlines = new google.maps.Rectangle({
            strokeColor: 'white',
            strokeOpacity: 0.3,
            strokeWeight: 6,
            fillOpacity: 0.0,
            map: map,
            bounds: subRegionsList[i]
        });
    }
    //add a highlight to the current subregion
    highlightSubRegion = new google.maps.Rectangle({
        strokeColor: 'white',
        strokeOpacity: 0.4,
        strokeWeight: 15,
        fillOpacity: 0.0,
        map: map,
        bounds: subRegionsList[currentSubRegionNumber]
    });


    //Add the square on the miniMap that tracks the main map view
    var viewTracker = new google.maps.Rectangle({
        fillOpacity: 0,
        strokeColor: 'blue',
        map: miniMap
    });

    //Add an event listener to handle the tracking of the minimap
    google.maps.event.addListener(map, 'bounds_changed', (function () {
        //Get the bounds of the map, then set the bounds of the history box.
        var mapBounds = map.getBounds();
        viewTracker.setBounds(mapBounds);
    }));

    //When the map is loaded in, then center the minimap.
    google.maps.event.addListenerOnce(map, 'tilesloaded', function () {
        miniMap.fitBounds(searchRegion.getBounds());
    });



    //----Adding buttons to the map-----

    //Creates the divs for the buttons and adds them to the map
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





    //-----Decision Logic-------

    //Holds the value of the rectangle representation of the judgement
    var judgementRectangle = null;

    //Handle the next button
    google.maps.event.addDomListener(nextControlDiv, 'click', nextFunction);

    function nextFunction() {

        //STUDY ONLY
        console.log("SubRegion ID: " + currentSubRegionNumber);
        console.log("Decision: " + judgementRectangle.yesNo);
        console.log("Time: " + getTimeElapsed(lastTaskEndTime).minutes + "m" + getTimeElapsed(lastTaskEndTime).seconds + "s");


        //---Process this subregion-----

        //TODO John is testing the db on only the first subregion
        if (currentSubRegionNumber == 0) {
            var send = {
                "time": getTimeElapsed(lastTaskEndTime).minutes * 60 + getTimeElapsed(lastTaskEndTime).seconds,
                "judgment": judgementRectangle.yesNo,
                "worker": 0,
                "index": currentSubRegionNumber,
                "region_id": 2
            };
            if (db) {
                $.post("/ground_truth/add/", send, function (res) {
                    console.log(res);
                });
            }

        }

        //Count the number of 'yes' judgements
        if (judgementRectangle.yesNo == 'yes') {
            yeses++;
        }

        //Mark the time they made this judgement
        lastTaskEndTime = new Date();

        //End condition for the task
        if (currentSubRegionNumber == subRegionsList.length - 1) {
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



        //----Set up next subregion-----

        //Disbale the next button for the next subregion until they have picked 'yes' or 'no'
        $("#nextButton").prop('disabled', true);

        //Update highlighted region
        highlightSubRegion.setMap(null);
        for (var i = 0; i < subRegionsList.length; i++) {
            var subRegionOutlines = new google.maps.Rectangle({
                strokeColor: 'white',
                strokeOpacity: 0.3,
                strokeWeight: 6,
                fillOpacity: 0.0,
                map: map,
                bounds: subRegionsList[i]
            });
        }
        highlightSubRegion = new google.maps.Rectangle({
            strokeColor: 'white',
            strokeOpacity: 0.4,
            strokeWeight: 15,
            fillOpacity: 0.0,
            map: map,
            bounds: subRegionsList[currentSubRegionNumber + 1]
        });

        //Draw the judgement on the miniMap
        if (judgementRectangle != null) {
            judgementsList.push(judgementRectangle);
            currentSubRegionNumber++;
            map.setCenter(subRegionsList[currentSubRegionNumber].getCenter());
            for (var i = 0; i < judgementsList.length; i++) {
                judgementsList[i].setMap(miniMap);
            }
            judgementRectangle = null;
        }
        //If the try to advance without making a judgement first
        else {
            swal("Please make a decision", "Use the 'Yes/Maybe' or 'No' button to indication your response.", "warning");
        }

    }


    //Handle the no button
    google.maps.event.addDomListener(noControlDiv, 'click', noFunction);

    function noFunction() {
        //If they previously made a judgement, erase that one from the map
        if (judgementRectangle != null) {
            judgementRectangle.setMap(null);
        }
        //Draw new judgement on the map
        judgementRectangle = new google.maps.Rectangle({
            strokeColor: 'red',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: 'red',
            fillOpacity: 0.2,
            map: miniMap,
            value: 0,
            bounds: subRegionsList[currentSubRegionNumber],
            yesNo: "no"
        });
        //They can now click the next button
        $("#nextButton").prop('disabled', false);

    }

    //Handle the yes button
    google.maps.event.addDomListener(yesControlDiv, 'click', yesFunction);

    function yesFunction() {
        //If they previously made a judgement, erase that one from the map
        if (judgementRectangle != null) {
            judgementRectangle.setMap(null);
        }
         //Draw new judgement on the map
        judgementRectangle = new google.maps.Rectangle({
            strokeColor: 'green',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: 'green',
            fillOpacity: 0.2,
            map: miniMap,
            value: 1,
            bounds: subRegionsList[currentSubRegionNumber],
            yesNo: "yes"
        });
        //They can now click the next button
        $("#nextButton").prop('disabled', false);
    }

    //Handle keyboard events
    google.maps.event.addDomListener(document, 'keyup', function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        // 'n' key
        if (code === 78) {
            noFunction();
        }
        // 'y' key
        else if (code === 89) {
            yesFunction();
        }
        // 'Enter' key
        else if (code === 13) {
            nextFunction();
        }
    });


    //Keep the user in the bounds of the subregion
    var lastValidCenter = map.getCenter();
    google.maps.event.addListener(map, 'center_changed', function () {
        if (subRegionsList[currentSubRegionNumber].contains(map.getCenter())) {
            lastValidCenter = map.getCenter();
            return;
        }
        //swal("Looks like your trying to explore outside of your region", "Please stay inside the bounds")
        map.panTo(lastValidCenter);
    });

    //Reference image rotation controls
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
    nextButton.id = "nextButton";
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
	  
	  

