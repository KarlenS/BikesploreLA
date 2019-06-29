//adopted from https://github.com/lemartinet/cycle-safe

// Loading required modules
var L = require('./leaflet'),
    Router = require('./router'),
    util = require('./util'),
    nearest = require('@turf/nearest'),
    extent = require('turf-extent');
    //gauge = require('gauge-progress')(),
    distance = require('@turf/distance').default,
    point = require('@turf/helpers').point,
    lineDistance = require('@turf/line-distance'),
    config = require('./config');
    var Slider = require("bootstrap-slider");

require('leaflet.icon.glyph');
require('./distr/leaflet-routing-machine');
require('leaflet-control-geocoder');

// Helper functions
function toPoint (wp) {
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [wp.lng, wp.lat]
        }
    };
}

function toPoint2 (lng,lat) {
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [lng, lat]
        }
    };
}
// Creating the map object
var map = L.map('map');

var position;


// Setting the map background to Mapbox
L.tileLayer('https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}{r}.png?access_token={token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>", token : config.apiToken
    })
    .addTo(map);

// Loading the network from the server with a nice animation
var net;
L.alpha = 1;


var sites;


var xhr2 = new XMLHttpRequest();
xhr2.onload = function() {
    if (xhr2.status === 200) {
        setTimeout(function() {
            sites = JSON.parse(xhr2.responseText);
        });
    }
    else {
        alert('Could not load sites network :( HTTP ' + xhr2.status);
    }
};

xhr2.open('GET', 'static/sites.geojson');
xhr2.send();

//gauge.start();
var xhr = new XMLHttpRequest();
xhr.addEventListener('progress', function(oEvent) {
    //if (oEvent.lengthComputable) {
    //    gauge.progress(oEvent.loaded, oEvent.total);
    //}
});
xhr.onload = function() {
    //gauge.stop();
    if (xhr.status === 200) {
        //gauge.progress(100, 100);
        setTimeout(function() {
            net = JSON.parse(xhr.responseText);
            initialize(net);
        });
    }
    else {
        alert('Could not load routing network :( HTTP ' + xhr.status);
    }
};

xhr.open('GET', 'static/acc_layer2.geojson');
xhr.send();

function filter_sites(a, b, dlim){
    var d = distance(toPoint(a),toPoint2(b[0],b[1]));
    if (d < dlim) { 
        return true;
    }
    else {
        return false;
    }
}


var control;

var control_default;

function initialize(network) {

    //control_default = L.Routing.control({
    //waypoints: [
    //    L.latLng(34.066666, -118.410673),
    //    L.latLng(34.055582, -118.38347)
    //],
    //geocoder: L.Control.Geocoder.nominatim(),
    //routeWhileDragging: true,
    //reverseWaypoints: true,
    ////showAlternatives: true,
    //altLineOptions: {
    //    styles: [
    //        {color: 'black', opacity: 0.15, weight: 9},
    //        {color: 'white', opacity: 0.8, weight: 6},
    //        {color: 'blue', opacity: 0.5, weight: 2}
    //    ]
    //},
    //    router: L.Routing.mapbox(config.apiToken)
    //}).on('routesfound', function(e) {
    //  var routes2 = e.routes;
    //  console.log(routes2[0].coordinates);
    //}).addTo(map);


    
    var router = new Router(network); // Use our custom router using risk
    control = L.Routing.control({
        createMarker: function(i, wp) {
            return L.marker(wp.latLng, {
                icon: L.icon.glyph({ prefix: '', glyph: String.fromCharCode(65 + i) }),
                draggable: true
            })
        }, // Setup marker properties (add a letter on them A, B, ...)
        geocoder: L.Control.Geocoder.mapbox(config.apiToken), // Use mapbox to geocode addresses
        router: router, // Our router
        routeWhileDragging: true, // Update the path dynamically when moving markers
        routeDragInterval: 100, // Update frequency
        lineOptions: { // Tune the color of the path on the map
            styles: [{color: 'blue', opacity: 0.8, weight: 5}]
         }
        })
        .on('routesfound', function(e) {
            // When a route is found, display summary measures if the risk-based route is selected
            var infoContainer = document.querySelector('.leaflet-testbox');
            var routes = e.routes;


            infoContainer.innerHTML = '<h2>Distance: ' + (routes[0].summary.totalDistance/1000).toFixed(2) + ' km </h2>';
            //infoContainer.innerHTML += '<br> <br> <h2>Options:</h2>';
			infoContainer.innerHTML += ' <button type="button" class="dirbutt btn btn-success">Get Directions</button>';
			infoContainer.innerHTML += ' <br> <button type="button" class="attractbutt btn btn-dark">Show Attractions</button>';
			//infoContainer.innerHTML +='<div class="checkbox"> <input id="chbox" type="checkbox" data-toggle="toggle" data-onstyle="info"> </div>';

            //infoContainer.innerHTML += ' <button type="button" class="btn btn-danger">KillMe!</button>';


            //if (L.alpha == 1) {
                //infoContainer.innerHTML += '<br> Total Accident Risk: ' + routes[0].summary.totalTime.toFixed(2);
                //infoContainer.innerHTML += '<br/>Time/Distance: ' + (1000*routes[0].summary.totalTime/routes[0].summary.totalDistance).toFixed(2);
                //infoContainer.innerHTML += '<br/>Average Accident Chance: ' + (routes[0].summary.totalTime/routes[0].coordinates.length).toFixed(2);
                infoContainer.innerHTML +=
                    '<p style="font-size: 16pt;"> Ride safe. Have fun. Don\'t die.</p>';

                 infoContainer.innerHTML += '<p style="font-size: 12pt; color:red;"> <u>Note</u>: not available east of Beverly Hills.</p>';
            //}


            const alphabutt = $(".dirbutt");
            
    
            alphabutt.on("click", function() {
                var poop = $("#ex1");
                var opt = poop.attr('value');
                L.alpha=opt*0.33;
                update(net);
                event.preventDefault();
            });


			const mybutton = $(".attractbutt");

			//const slidebox = $("#chbox");
			//slidebox.change(function() {
			//	alert("BOOOM!")
			//});

        	mybutton.on("click", function() {

			if ($( this ).hasClass( "btn-dark" )){

				$( this ).removeClass('btn-dark').addClass('btn-info');
			

				$ ( this ).html("Hide Attractions");


            var wp1 = routes[0].inputWaypoints[0].latLng;

            var filtered_features = [];



            for (var i = 0; i < sites.features.length; i++) {
                if (filter_sites(wp1,sites.features[i].geometry.coordinates,2)){
                    var title = sites.features[i].properties.title;

                    var but = '<button type="button" class="mybutt btn btn-primary">Take me here!!</button>';
					//'<p/><br><img src="static/Caique.png" style="width:100px;height:100px;"/> <br> '
                    sites.features[i].properties.popupContent='<p>' + title.split('_').join(' ') + ' </p> <br><br> ' + but;
                    filtered_features.push(sites.features[i]);
                }
            }
            //control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
            
            filtered_sites = {
                "type": "FeatureCollection",
                "features": filtered_features
            };
            L.geoJSON(filtered_sites, {
                onEachFeature: onEachFeature2
            }).addTo(map);
			

			}

			else {           

                $( this ).removeClass('btn-info').addClass('btn-dark');
				$ ( this ).html("Show Attractions");

				var removeMarkers = function() {
				    map.eachLayer( function(layer) {
				
				      if ( layer.myTag &&  layer.myTag === "myGeoJSON") {
				        map.removeLayer(layer)
				          }
				
				        });
				
				}
				
			    removeMarkers();	

            }

			});

        })
        .addTo(map);
    
    // Add an html container to store the summary info
    var container = L.DomUtil.create('div', 'leaflet-testbox');
    // 	input = L.DomUtil.create('input', '', container);
    // control.getContainer().appendChild(container);
    // control.getContainer().appendChild(input);
    var infoContainer = document.querySelector('.leaflet-routing-container');
    infoContainer.appendChild(container);

    L.Routing.errorControl(control).addTo(map); // Allow error messages to be displayed in the box

    // Compute summary info about the network
    var totalDistance = network.features.reduce(function(total, feature) {
            if (feature.geometry.type === 'LineString') {
                return total += lineDistance(feature, 'kilometers');
            } else {
                return total;
            }
        }, 0),
        graph = router._pathFinder._graph.compactedVertices,
        nodeNames = Object.keys(graph),
        totalNodes = nodeNames.length,
        totalEdges = nodeNames.reduce(function(total, nodeName) {
            return total + Object.keys(graph[nodeName]).length;
        }, 0);

    // Display the results in the HTML
    var infoContainer = document.querySelector('#info-container');
    [
        ['Total Road Length', totalDistance, 'km'],
        ['Network Nodes', totalNodes / 1000, 'k'],
        ['Network Edges', totalEdges / 1000, 'k'],
        ['Coordinates', router._points.features.length / 1000, 'k']
    ].forEach(function(info) {
        var li = L.DomUtil.create('li', '', infoContainer);
        li.innerHTML = info[0] + ': <strong>' + Math.round(info[1]) + (info[2] ? '&nbsp;' + info[2] : '') + '</strong>';
    });

    // Prepare a new layer to display all the street risks
    var networkLayer = L.layerGroup(),
        vertices = router._pathFinder._graph.sourceVertices,
        weights = router._pathFinder._graph.vertices,
        renderer = L.canvas().addTo(map);
        nodeNames.forEach(function(nodeName) {
        var node = graph[nodeName];
        Object.keys(node).forEach(function(neighbor) {
            var c1 = vertices[nodeName],
                c2 = vertices[neighbor];
                w = weights[nodeName][neighbor];
            function getColor(value){
                //value from 0 to 1
                var hue=((1-value)*120).toString(10);
                return ["hsl(",hue,",100%,50%)"].join("");
            }
            L.polyline([[c1[1], c1[0]], [c2[1], c2[0]]], { weight: 2, color:getColor(w), renderer: renderer, interactive: false })
                .addTo(networkLayer)
                .bringToBack();
        });
    });

    // Add a control to display the layer
    L.control.layers(null, {
        'Accident Threat': networkLayer,
    }, { position: 'bottomleft'}).addTo(map);

    // Set default start and end points when the user connects on the app
    // This triggers the search for a route right away
    control.setWaypoints([
		//[position.coords.latitude,position.coords.longitude],
		//[position.coords.latitude,position.coords.longitude],
		[34.066666, -118.410673],
		[34.055582, -118.383475],
    ]);

}



function onEachFeature(feature, layer) {
    var popupAuto = L.popup()
                    .setLatLng([feature.geometry.coordinates[1], feature.geometry.coordinates[0]])  // sets popup in polygon's centroid
                    .setContent(feature.properties.popupContent)
                    .openOn(map);
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}


function onEachFeature2(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        //layer.bindPopup(feature.properties.popupContent);

	layer.myTag = "myGeoJSON"

  	layer.bindPopup(feature.properties.popupContent).on("popupopen", () => {
		const mybutton = $(".mybutt")

		mybutton.on("click", e => {
			
  	    	e.preventDefault();
        	control.spliceWaypoints(control.getWaypoints().length - 1, 1, feature.geometry.coordinates.reverse());
            layer.closePopup();

		
  	    //alert(`now delete layer with id ${feature.properties.id}`);
  	  });

		//var container = L.DomUtil.create('div'),
        //destBtn = createButton('Go to this location', container);


		//    L.popup()
		//        .setContent(container)
		//        .setLatLng(e.latlng)
		//        .openOn(map);
		})

}
}
            //control.spliceWaypoints(control.getWaypoints().length-1, 1, feature.geometry);
            //map.on('click', function(e) {
            //    var container = L.DomUtil.create('div'),
            //        destBtn = createButton('Go to this location', container);
            //
            //    L.popup()
            //        .setContent(container)
            //        .setLatLng(e.latlng)
            //        .openOn(map);
            //});

            //L.DomEvent.on(destBtn, 'click', function() {
            //    control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
            //    map.closePopup();
            //});



// Display the bike lane network
// $.getJSON("static/Existing_Bike_Network.geojson",function(data){
	// add GeoJSON layer to the map once the file is loaded
    // L.geoJson(data).addTo(map).bringToBack();
//   });


// Setup some links to allow differents types of route to be computed 
// The user can choose between fast, intermediate and safest
//window.onload = function() {
//	// setup the JSON Submit button 
//	document.getElementById("fastest_route").onclick = function() {
//        // sendJSON();
//        L.alpha = 0;
//        update(net);
//        // stop link from reloading the page
//	    event.preventDefault();
//    };
//    document.getElementById("safest_route").onclick = function() {
//        // sendJSON();
//        L.alpha = 1;
//        update(net);
//        // stop link from reloading the page
//	    event.preventDefault();
//    };
//    document.getElementById("interm_route").onclick = function() {
//        // sendJSON();
//        L.alpha = 0.5;
//        update(net);
//        // stop link from reloading the page
//	    event.preventDefault();
//	};
//}
//
// This is called when a user clicks a link to update the router object
function update(network) {
	// var firstload = 1;
    var router = new Router(network);
    // This sets the router object to the Mapbox router
    // options = {
    //     serviceUrl: 'https://api.mapbox.com/directions/v5',
    //     profile: 'mapbox/cycling',
    //     useHints: false
    // };
    // var router = L.routing.mapbox(config.apiToken, options);
    control.router = control._router = control.options.router = router;
    control.route({});
}

window.onload = function() {
control = L.Routing.control({});
    
	    position = {
	      coords: {
	        latitude: '',
	        longitude: ''
	      }
	    };
	
	$.getJSON("http://ip-api.com/json", function (data, status) {

		if(status === "success") {
            if(data) {
        position.coords.latitude = data.lat;
        position.coords.longitude = data.lon;
}
}

	});

    //var poop = new Slider("#ex1", {
    //});
    //var poop = $("#ex1");
    //console.log(poop);


    //poop.on("change", function (e){
    
    //var opt = e.newValue;

    //L.alpha = opt*0.33; 
    //update(net);
  // stop link from reloading the page
    //event.preventDefault();
//});

}

//function setStartWaypoint(position) {
//    alert(position.coords.latitude,position.coords.longitude)
//}
