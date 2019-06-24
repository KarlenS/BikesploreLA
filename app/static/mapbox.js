var map = L.map('map');

var socket = io.connect('http://' + document.domain + ':' + location.port + '/');

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const key = 'pk.eyJ1Ijoic2hrYXJsZW4iLCJhIjoiY2p3d20wM252MGxoazQzbjU4aHFoOWMybCJ9.kF_uQSONrElBOKGGDGMPmg';

var bikerouter = L.Routing.mapbox(key)
bikerouter.options.profile = 'mapbox/cycling';

var control = L.Routing.control({
	waypoints: [
        L.latLng(34.100833, -118.336389),
        L.latLng(34.0628, -118.356)
	],
    router: bikerouter,
	geocoder: L.Control.Geocoder.nominatim(),
	routeWhileDragging: true,
	reverseWaypoints: true,
	showAlternatives: true,
	altLineOptions: {
		styles: [
			{color: 'black', opacity: 0.15, weight: 9},
			{color: 'white', opacity: 0.8, weight: 6},
			{color: 'blue', opacity: 0.5, weight: 2}
		]
	},
})
.on('routesfound',function(e){
    var routes = e.routes;//modify this shit on here!!!!
    
    socket.on('newroute', function(data) {
        //alert(data['msg']);
        
    });
    socket.emit('gotroute',JSON.stringify(routes));
    //post this??
    //alert(JSON.stringify(routes));
})
.addTo(map);

L.Routing.errorControl(control).addTo(map);
