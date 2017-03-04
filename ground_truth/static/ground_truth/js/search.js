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

var db = true;

//Initialize the map and event handlers
function initMap() {
    $.getJSON("region/?region=6", function (data) {
        var json = data;

         $('#mysteryImage').attr("src", json['img']);

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

        var regionBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(json.bounds.lat_start, json.bounds.lon_start),
                new google.maps.LatLng(json.bounds.lat_end, json.bounds.lon_end)
            );
        miniMap = new google.maps.Map(document.getElementById('miniMap'), {
            zoom: 11,
            center: regionBounds.getCenter(),
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
            bounds: regionBounds
        });

        var SIZE = 5;
        var ZOOM = parseInt(json['zoom']);


        //----Process the larger region into subregions, store subregions in subRegionsList, and draw----

        //Construct the subregions in the creeping line search pattern
        //Starting with bottom left i.e. SW corner
        for (var i = 0; i < json.sub_regions.length; i++) {
            var s = json.sub_regions[i].bounds;
            var subRegionBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(s.lat_start, s.lon_start),
                new google.maps.LatLng(s.lat_end, s.lon_end)
            );
            var subRegion = json.sub_regions[i];
            subRegion.bounds = subRegionBounds;
            subRegionsList.push(subRegion);
        }

        //Draw the subregions on the miniMap
        for (var i = 0; i < subRegionsList.length; i++) {
            var subRegion = new google.maps.Rectangle({
                strokeColor: 'gray',
                strokeOpacity: 0.5,
                strokeWeight: .5,
                fillOpacity: 0.0,
                map: miniMap,
                bounds: subRegionsList[i].bounds
            });
        }


        // Initializes the main search map to subregion 0.
        map = new google.maps.Map(document.getElementById('mainView'), {
            tilt: 0,
            zoom: ZOOM,
            center: subRegionsList[currentSubRegionNumber].bounds.getCenter(),
            mapTypeId: 'satellite',
            draggable: true,
            scrollwheel: true,
            minZoom: ZOOM,
            bounds: subRegionsList[currentSubRegionNumber].bounds

        });

        //Draw the subregions on the main map
        for (var i = 0; i < subRegionsList.length; i++) {
            var subRegionOutlines = new google.maps.Rectangle({
                strokeColor: 'white',
                strokeOpacity: 0.3,
                strokeWeight: 6,
                fillOpacity: 0.0,
                map: map,
                bounds: subRegionsList[i].bounds
            });
        }
        //add a highlight to the current subregion
        highlightSubRegion = new google.maps.Rectangle({
            strokeColor: 'white',
            strokeOpacity: 0.4,
            strokeWeight: 15,
            fillOpacity: 0.0,
            map: map,
            bounds: subRegionsList[currentSubRegionNumber].bounds
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

            var send = {
                "judgment": judgementRectangle.yesNo,
                "worker": 0,
                "sub_region": subRegionsList[currentSubRegionNumber].sub_region_id,
                "duration": getTimeElapsed(lastTaskEndTime).minutes * 60 + getTimeElapsed(lastTaskEndTime).seconds,
                "datetime": lastTaskEndTime
            };
            console.log(send);
            if (db) {
                $.post("/ground_truth/add_judgment/", send, function (res) {
                    console.log(res);
                });
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
                    bounds: subRegionsList[i].bounds
                });
            }
            highlightSubRegion = new google.maps.Rectangle({
                strokeColor: 'white',
                strokeOpacity: 0.4,
                strokeWeight: 15,
                fillOpacity: 0.0,
                map: map,
                bounds: subRegionsList[currentSubRegionNumber + 1].bounds
            });

            //Draw the judgement on the miniMap
            if (judgementRectangle != null) {
                judgementsList.push(judgementRectangle);
                currentSubRegionNumber++;
                map.setCenter(subRegionsList[currentSubRegionNumber].bounds.getCenter());
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
                bounds: subRegionsList[currentSubRegionNumber].bounds,
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
                bounds: subRegionsList[currentSubRegionNumber].bounds,
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
            if (subRegionsList[currentSubRegionNumber].bounds.contains(map.getCenter())) {
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

    });//end of get
}//end of initMap

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
    noButton.id = "noButton";
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
    yesButton.id = "yesButton";
    yesButton.style.marginTop = '10px';
    yesButton.style.marginRight = '10px';
    yesButton.type = "button";
    yesButton.name = "add";
    yesButton.value = "Yes / Maybe";
    yesButton.className = "btn btn-success";
    controlDiv.appendChild(yesButton);
}
	  
	  

