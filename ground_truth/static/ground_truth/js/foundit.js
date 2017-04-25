/**
 * Created by John on 4/25/17.
 */
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: {lat: lat, lng: lon},
        mapTypeId: 'satellite',
        draggable: true,
        scrollwheel: true,
        streetViewControl: false,
        tilt: 0
    });
}