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
 var startTime;

  //Initialize the map and event handlers
 function initMap() {
 startTime = new Date();
 var endTime = new Date(startTime.getTime() + 10*60000); // 10 minutes
	  
	  function getTimeRemaining(endTime){
		  var t = Date.parse(endTime) - Date.parse(new Date());
		  var seconds = Math.floor( (t/1000) % 60 );
		  var minutes = Math.floor( (t/1000/60) % 60 );
		  var hours = Math.floor( (t/(1000*60*60)) % 24 );
		  var days = Math.floor( t/(1000*60*60*24) );
		  return {
			'total': t,
			'days': days,
			'hours': hours,
			'minutes': minutes,
			'seconds': seconds
		  };
		}
		
		function getTimeElapsed(startTime){
		  var t = Date.parse(new Date()) - Date.parse(startTime);
		  var seconds = Math.floor( (t/1000) % 60 );
		  var minutes = Math.floor( (t/1000/60) % 60 );
		  var hours = Math.floor( (t/(1000*60*60)) % 24 );
		  var days = Math.floor( t/(1000*60*60*24) );
		  return {
			'total': t,
			'days': days,
			'hours': hours,
			'minutes': minutes,
			'seconds': seconds
		  };
		}
		console.log(getTimeElapsed(startTime));
		
		function initializeClock(id, endtime){
		  var clock = document.getElementById(id);
		  var timeinterval = setInterval(function(){
			var remainingTime = getTimeRemaining(endtime);
			if(remainingTime.seconds < 10){
				clock.innerHTML = 'Time Remaining ' + remainingTime.minutes + ':0' + remainingTime.seconds;
			}
			else{
				clock.innerHTML = 'Time Remaining ' + remainingTime.minutes + ':' + remainingTime.seconds;
			}
			if(remainingTime.total<=0){
			  clearInterval(timeinterval);
			  swal("Bummer!", "You ran out of time", "error")
			}
		  },1000);
		}
		
		initializeClock('clockdiv', endTime);
 

//Serves a minimap for tracking search history
  miniMap = new google.maps.Map(document.getElementById('miniMap'), {
    zoom: 11,
    center: new google.maps.LatLng(-15.797342, -47.871063),
    mapTypeId: 'terrain',
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
		
	 var searchWidth = searchRegion.getBounds().getNorthEast().lng() - searchRegion.getBounds().getSouthWest().lng();
	 var searchHeight = searchRegion.getBounds().getNorthEast().lat() - searchRegion.getBounds().getSouthWest().lat();
	 subRegionWidth = searchWidth/ SIZE;
	 subRegionHeight = searchHeight/ SIZE;
	 for (var i = SIZE; i > 0; i--){
		if(i%2 == 0){
			for (var j = 1; j < SIZE + 1; j++){
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
		else{	
			for (var j = SIZE; j > 0; j--){
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
	tilt:0,
    zoom: ZOOM,
    center: subRegions[regionNumber].getCenter(),
    mapTypeId: 'satellite',
	draggable: true,
	scrollwheel: true,
	minZoom: ZOOM,
	bounds: subRegions[regionNumber]

  });
  for(var i = 0; i < subRegions.length; i++){
	var subRegionMain = new google.maps.Rectangle({
		  strokeColor: 'white',
		  strokeOpacity: 0.3,
		  strokeWeight: 6,
		  fillOpacity: 0.0,
		  map: map,
		  bounds: subRegions[i]
	});	
  }
  
  //This rectangle is the red rectangle that appears in the minimap
  var historyBox = new google.maps.Rectangle({
    fillOpacity: 0,
    strokeColor: 'blue',
    map:miniMap
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
  google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
  	miniMap.fitBounds(searchRegion.getBounds());
});


 var decisionRectangle = null; 
  //Handle the next button
  google.maps.event.addDomListener(nextControlDiv, 'click', nextFunction);
  
  function nextFunction() {
  
		if(regionNumber == subRegions.length-1){			
			swal({
			  title: "Thank you!",
			  text: "You have now completed the task! </br>" + "Time to complete: " + getTimeElapsed(startTime).minutes + ":" + getTimeElapsed(startTime).seconds,
			  type: "success",
			  html: true
			});
		 }
		 $("#nextButton").prop('disabled', true);
	 //TODO John: deicsionRectangle is an object that holds all the info for the region and the yes/no. Might also need subRegions[regionNumber]. 
	 //This push call is simulating sending to db
	 if(decisionRectangle != null){
		 decisions.push(decisionRectangle);
		 regionNumber++;
		 map.setCenter(subRegions[regionNumber].getCenter());
		 for(var i = 0; i < decisions.length; i++){
			decisions[i].setMap(miniMap);
		 }
		 decisionRectangle = null; 
		 console.log(regionNumber);	 
	 }
	 else{
		swal("Please make a decision", "Use the 'Yes/Maybe' or 'No' button to indication your response.", "warning");
	 }
}


  //Handle the no
  google.maps.event.addDomListener(noControlDiv, 'click', noFunction);
  
function noFunction() {
	if(decisionRectangle != null){
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
		  bounds: subRegions[regionNumber]
		});
	$("#nextButton").prop('disabled', false);

}

//Add a listener to handle the mark history button being clicked
 google.maps.event.addDomListener(yesControlDiv, 'click', yesFunction);

function yesFunction() {
     //Check if it's the right size, can be easily changed 
     if(map.getZoom() < 17){
     	window.alert("You must be zoomed in further for your history to be tracked")
     	return;
     }
	 if(decisionRectangle != null){
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
		  bounds: subRegions[regionNumber]
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

google.maps.event.addListener(map, 'center_changed', function() {
    if (subRegions[regionNumber].contains(map.getCenter())) {
        // still within valid bounds, so save the last valid position
        lastValidCenter = map.getCenter();
        return; 
    }
	//swal("Looks like your trying to explore outside of your region", "Please stay inside the bounds")
    // not valid anymore => return to last valid position
    map.panTo(lastValidCenter);
});  

$('#rot-left').on('click', function(event) {
  event.preventDefault();
  $('#mysteryImage').rotate(-45);
  
});

$('#rot-right').on('click', function(event) {
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
		nextButton.value= text;
		nextButton.className="btn btn-lg btn-primary";
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
		noButton.value= "No";
		noButton.className="btn btn-danger";
		controlDiv.appendChild(noButton);
      }

       function yesControlMethod(controlDiv, map) {
		var yesButton = document.createElement("input");
		yesButton.id = "yesButton"
		yesButton.style.marginTop = '10px';
		yesButton.style.marginRight = '10px';
		yesButton.type = "button";
		yesButton.name = "add";
		yesButton.value= "Yes / Maybe";
		yesButton.className="btn btn-success";
		controlDiv.appendChild(yesButton);
      }

      //Translate the bounds to cordinates, CW is a boolean.
      //If true, make the returned coordinates boolean. 
      function transBoundsToCord(bounds,CW){
      	var NE = bounds.getNorthEast();
      	var SW = bounds.getSouthWest();
      	var SE = new google.maps.LatLng(SW.lat(),NE.lng());
       	var NW = new google.maps.LatLng(NE.lat(), SW.lng());

       	var path = [];

       	if(CW){
       		path.push(NE);
       		path.push(SE);
       		path.push(SW);
       		path.push(NW);
       	}
       	else{
       		path.push(NE);
       		path.push(NW);
       		path.push(SW);
       		path.push(SE);
       	}

       	return path;
      }
	  
	  

