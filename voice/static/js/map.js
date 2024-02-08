var map = null;
var bounds;
var currentPos = null;
var placesFound = [];
const BROWSER_NOT_COMPATIBLE = 1;
const BROWSER_ACCEPTED = 2;
const BROWSER_NEGATED = 3;
var geolocationStatus = BROWSER_NOT_COMPATIBLE;
var directionsRenderer = null;

function initMap(places) {
    let infoWindow;
    let currentInfoWindow;
    bounds = new google.maps.LatLngBounds();
    infoWindow = new google.maps.InfoWindow;
    currentInfoWindow = infoWindow;
    
    if (geolocationStatus === BROWSER_NOT_COMPATIBLE) {
        // El navegador no soporta la Geolocalizacion
        handleLocationError(false, infoWindow);
        return false;
    }

    if (geolocationStatus === BROWSER_NEGATED) {
        // El navegador soporta la geolocalizacion pero se denego el permiso
        handleLocationError(true, infoWindow);
        return false;
    }

    if (geolocationStatus === BROWSER_ACCEPTED) {
        //if (map === null) {
            map = new google.maps.Map(document.getElementById('mapResults'), {
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
        //}
        //bounds.extend(currentPos);
        //map.fitBounds(bounds)

        var marcador = new google.maps.Marker({
            position: currentPos,
            map: map,
            title: 'Tu ubicación'
        });

        var circle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.2,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.2,
            map: map,
            radius: 1500
        });

        circle.bindTo('center', marcador, 'position');

        infoWindow.setPosition(currentPos);
        infoWindow.setContent('Tu ubicación');
        map.setZoom(15);
        map.setCenter(currentPos);
        
        createMarkers(places)

        
    }
}

//Error al obtener la posicion 
function handleLocationError(browserHasGeolocation, infoWindow) {
    // Muestra una posicion por defecto (Escuela de ingenieria de sistemas)
    let pos = { lat: 3.375680, lng: -76.529383 };
    map = new google.maps.Map(document.getElementById('mapResults'), {
        center: pos,
        zoom: 15
    });

    // Muestra una ventana informativa en el centtro del mapa
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Permisos de Geolocalizacion denegados, se usara una posicion por defecto.' :
        'Error: el navegador no soporta la geolocalizacion.');
    infoWindow.open(map);
    currentInfoWindow = infoWindow;
}

function createMarkers(places) {
    places.forEach(place => {
        const infoWindow = new google.maps.InfoWindow();

        let zoom = map.getZoom();
        let relativePixelSize = Math.round(zoom/22*50)
        let newSize = new google.maps.Size(relativePixelSize, relativePixelSize);

        let marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            animation: google.maps.Animation.DROP,
            title: `${place.name}, ${place.vicinity}`,
            icon: {
                url: place.icon,
                size: newSize,
                scaledSize: newSize,
                origin: null,
                anchor: null,
            },
        })
        placesFound.push(marker)
        //console.log(place);

        google.maps.event.addListener(marker, "click", function (places) {
            // Open Infowindow
            infoWindow.close();
            infoWindow.setContent(marker.getTitle(),marker);
            infoWindow.open(marker.getMap(), marker);
            
        });
        
        return marker;
    });


}


function deleteMarkers() {  //Borrar los marcadores que quedan en memoria
    hideMarkers();
    placesFound = [];
}

function hideMarkers() {  //Poner los marcadores sin renderizar para quitarlos del mapa
    setMapOnAll(null);
}

function setMapOnAll(map) {  //Cambia el estado del mapa donde se ponen los marcadores
    for (let i = 0; i < placesFound.length; i++) {
        placesFound[i].setMap(map);
    }
}

function drawRoute(place) { //Dibuja la ruta del mapa
    if (directionsRenderer !== null) {
        directionsRenderer.setMap(null)
    }
    //Routes
    const directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();

    directionsRenderer.setMap(map);

    const request = {
        origin: currentPos,
        destination: place.geometry.location,
        travelMode: 'DRIVING'
    };
    directionsService.route(request, response => {
        directionsRenderer.setDirections(response);
    });
}

function updateCurrentPosition() {
    // Se verifica si el navegador permite geolocalizacion
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            currentPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            geolocationStatus = BROWSER_ACCEPTED
        }, () => {
            // El navegador soporta la geolocalizacion pero se denego el permiso
            geolocationStatus = BROWSER_NEGATED
        });
    }
}

window.addEventListener('load', function () {
    updateCurrentPosition()
}, false);