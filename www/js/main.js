var positionLat = "";
var positionLng = "";

// --- turn off ajax async loading
$.ajaxSetup({
	async: false
});

// --- defered variables
var deviceReadyDeferred = $.Deferred();
var jqmReadyDeferred = $.Deferred();

// --- device ready
document.addEventListener("deviceReady", deviceReady, false);
function deviceReady() {
	deviceReadyDeferred.resolve();
}

// --- jquery mobile page ready
$(document).one("pagebeforeshow", function() {
	jqmReadyDeferred.resolve();
});

// --- when device and jquery loaded
$.when(deviceReadyDeferred, jqmReadyDeferred).then(doWhenBothFrameworksLoaded);

// --- on document and device ready
function doWhenBothFrameworksLoaded() {
	navigator.geolocation.getCurrentPosition(onSuccess, onError);
	//document.addEventListener("resume", onResume, false);
	
	$("#refreshButton").on("tap", function() {
		$("#mainListView").empty();
		searchLocation();
	});
}

// --- search locations from google api types
function searchLocation() {
	var locations = ["food", "park", "pharmacy", "train_station", "bus_station"];
	var locationNames = ["FOOD", "PARK", "PHARMACY", "TRAIN", "BUS"];
	//var locations = ["train_station"];
	
	
	
	for (var i = 0; i < locations.length; ++i) {
		setTimeout(function(x) { 
			return function() { 
				$("#mainListView").append(getLocation(locations[x], locationNames[x])); }; }(i), 1000*i);
	}

	
	
}

// --- get location
function getLocation(location, locationName) {
	var url =  'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' +
		'types=' + location + '&' +
		'rankby=distance&' +
		'location=' + positionLat +  ',' + positionLng +'&' +
		'sensor=true&' +
		'key=AIzaSyCf5VSoqr-bkjfvIMWpy25MiKT37VcyX0o';
	var tempName;
	var tempAddress;
	var tempDistance;
	$.getJSON(url, function(places) {
		var place = places.results[0];
		
		tempName = place.name;
		tempAddress = getAddress(place.place_id);
		tempDistance = getDistance(positionLat, 
			positionLng, 
			place.geometry.location.lat, 
			place.geometry.location.lng);
		
		
	});
	
	$("#mainListView").append(createListView(tempName, tempAddress, tempDistance, locationName)).listview("refresh");
}

// --- get address
function getAddress(id) {
	var result = '';
	var url = 'https://maps.googleapis.com/maps/api/place/details/json?' +
		'placeid=' + id + '&' +
		'sensor=true&' +
		'key=AIzaSyCf5VSoqr-bkjfvIMWpy25MiKT37VcyX0o';
	
	$.getJSON(url, function(address) {
		result = address.result.formatted_address;
	});
	
	return result;
}

// --- get distance
function getDistance(lat1, lng1, lat2, lng2) {
	
	var rad = function(x) {
		return x * Math.PI / 180;
	}
	
	var distance = function() {
		var R = 6378137;
		var dLat = rad(lat2 - lat1);
		var dLong = rad(lng2 - lng1);
		var a = Math.sin(dLat / 2) * 
			Math.sin(dLat / 2) +
			Math.cos(rad(lat1)) * 
			Math.cos(rad(lat2)) *
			Math.sin(dLong / 2) * 
			Math.sin(dLong / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;
		return d;
	}
	
	return Math.round(distance());
}


// --- create list view
function createListView(pName, pAddress, distance, locationName) {
	var listView = '<li data-role="list-divider" >' +
					'<font size="+1" color="#0099FF">' + locationName + '</font>' +
					'<div class="ui-li-count">' + distance + ' m</div>' +
				'</li>' +
				'<li data-icon="location">' +
					'<font >' + pName + '</font>' +
				'</li>' +
				'<li style="text-align:right"><font size="0">' + pAddress + '</size></li>' +
				'<li data-theme="b"/>';
		
	return listView;
}

// onSuccess Geolocation
function onSuccess(position) {
	positionLat =  position.coords.latitude;
	positionLng = position.coords.longitude;
	searchLocation();
	
}

// onError
function onError(error) {
	//...
}