function initAnimation() {  // Intercambio de pantallas 
    let initPage = document.getElementById('paginaInicio')
    initPage.classList.toggle('fadeout')
    initPage.style.zIndex = 0
    let searchPage = document.getElementById('paginaBusqueda')
    searchPage.classList.toggle('fadein')
}
