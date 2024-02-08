let modalDiv = document.getElementById('mapModal') 
var myModal = new bootstrap.Modal(modalDiv, {
  keyboard: false,
  focus: true
})

var places = []

async function requestGet(uri = '') {  // Hace una peticion GET al servidor
  const response = await fetch(uri, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const responseJson = response.json()
  return responseJson
};

async function requestPost(uri = '', body = {}) { // Hace una peticion POST al servidor
  const response = await fetch(uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  })
  const responseJson = response.json()
  return responseJson
}

// Iniciar la aplicacion 
function initSearch() {  
  initAnimation()
  welcome()
  startRecording(true)
}

// Iniciar la busqueda
async function startSearch() {  
  let result = await startRecording(false)
  searchMap(result)
}

// Inicia el reconocimiento de voz
async function startRecording(isContinuous = false) {  
  if (recordButton.innerHTML === "Buscar") {
    recordButton.innerHTML = "Escuchando...";
  }
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
  var recognition = new SpeechRecognition();
  recognition.continuous = isContinuous;
  recognition.interimResults = false;
  recognition.lang = 'es-CO';
  recognition.start();
  let result = '';

  if (isContinuous) {   
    let counter = 0;
    let interval = setInterval(() => {
      counter++;
    }, 1000)

    recognition.onend = (event) => { // Tiempo minimo de duracion del Speech Recognition
      if (counter <= 10 * 60) {
        recognition.start()
      } else {
        clearInterval(interval)
      }
    };
  }

   // Devuelve el resultado transcrito -> Speech to text
  return new Promise((resolve, reject) => { 
    recognition.onsoundend = (event) => {
      recognition.stop();
      recordButton.innerHTML = "Buscar";
    };
  
    // Devuelve el resultado
    recognition.onresult = (event) => {  
      result = ''
      for (let i=event.resultIndex; i<event.results.length; i++) {
        let transcript = event.results[i][0].transcript;
        transcript.replace("\n","<br>")
        if (event.results[i].isFinal) {
          result += transcript;
        }
      }
      result = result.trim()
      if (isContinuous) {
        handleResult(result)
      } else {
        resolve(result)
      }
    };
  
    recognition.onerror = (event) => {};
  })
}

// Tomar la palabra del usuario y activa [buscar] la busqueda
function handleResult(result = '') { 
  result = result.toLowerCase()
  console.log(result)
  if (result.includes("buscar")) {
    result = result.replace("buscar ", '')
    searchMap(result)  // Ejecutar la busqueda
  }
  if (result.includes("cerrar")) {  // Tomar la palabra del usuario [cerrar] y cierra el modal 
    myModal.hide()
  }
  if(result.includes("ir a")) {   // Tomar la palabra del usuario [Ir a] para mostrar la ruta
    result = result.replace("ir a ", '')
    result = result.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
    goTo(result)
  }
}

// Buscar el lugar al que se quiere ir
function goTo(result = '') {  
  if (places.length == 0) {
    return false
  }

  // Filtra los lugares que encontro
  const placesFiltered = places.filter(place => {  
    const regex = new RegExp(result, 'i')
    return place.name.search(regex) > -1
  })
  console.log(result,placesFiltered)
  if (placesFiltered.length == 0) {
    return sayNoResults(result)
  }
  drawRoute(placesFiltered[0])
}

// Recibe la respuesta de la peticion del usuario y luego ejecuta la busqueda de los lugares cercanos
function searchMap(responseVoice = '') {  
  updateCurrentPosition()
  let lat = currentPos.lat
  let long = currentPos.lng
  getNearbyPlaces({keyword: responseVoice, lat: lat, long: long})
}

// Hace la peticion al servidor para obtener la ubicacion de los lugares cercanos
async function getNearbyPlaces({keyword='pizza', lat='3.375680', long='-76.529383', radius=1000, type='restaurant'}) {
  const uri = `/nearby-places?keyword=${keyword}&location=${lat}%2C${long}&radius=${radius}`
  const response = await requestGet(uri)
  loadResults(response, keyword)
};

// Carga los resultados en pantalla
function loadResults(results = {}, keyword = '') {
  if (results.places.status === "ZERO_RESULTS") {
    sayNoResults(keyword)
    return;
  }

  places = results.places.results
  showModal()
  sayResults(keyword)
}

const synth = window.speechSynthesis;

// Sistema -> Hablar
function welcome() {
  talk("¡Bienvenido a Smart app! ¿En qué puedo ayudarle?") // Bienvenida al usuario
}

function sayResults(searchText = '') {
  talk(`Estos son los resultados de: ${searchText} a tu alrededor`) // Cuando encuentra el lugar
}

function sayNoResults(searchText = '') {
  talk(`No he podido encontrar: ${searchText} intentalo de nuevo`)  // Cuando no encuentra un lugar
}

// Voz del programa
function talk(text = "") {
  const utterThis = new SpeechSynthesisUtterance(text);

  const voices = synth.getVoices();
  for (const voice of voices) {
    if (voice.name === 'Microsoft Sabina - Spanish (Mexico)') {
      utterThis.voice = voice;
    }
  }
  synth.speak(utterThis);
}

// Se abre el mapa con los resultados
function showModal() {
  async function loadMap(event) {
    initMap(places)
    loadList()
  }

  modalDiv.addEventListener('show.bs.modal', loadMap)

  modalDiv.addEventListener('hidden.bs.modal', (event) => {
    deleteMarkers()
    places = []
    modalDiv.removeEventListener('show.bs.modal', loadMap)
  })

  myModal.show()
}

// Lista de resultados de la busqueda
function loadList() {
  if (places.length == 0) {
    return false
  }

  listResults.innerHTML = ''
  places.forEach(place => {
    html = '<div class="list-container row">'
    html +=   `<a class="col-10 list-body list-link control-display" onclick="goTo('${place.name}')">`
    html +=     '<div class="list-detail">'
    html +=       '<div class="list-heading">'
    html +=         '<span class="text-heading">'+place.name+'</span>'
    html +=       '</div>'
    if (place?.opening_hours?.open_now) {
      html +=       `<div><span class="business-open">Abierto</span></div>`
    }
    html +=       `<div><span>${place.vicinity}</span></div>`
    html +=       `<div><span>${place.plus_code.compound_code.slice(8)}</span></div>`
    html +=     '</div>'
    html +=   '</a>'
    html +=   `<a class="col-2 list-image list-link control-display" onclick="goTo('${place.name}')">`
    html +=     `<img src="${place.icon}" width="50">`
    html +=   '</a>'
    html += '</div>'

    listResults.innerHTML += html
  });
}
