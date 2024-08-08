const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

//Variables 
const previewsDirectory = path.join(__dirname, '../imgPreviews')
let searchButton
let download
let downloadButton
let loader

//Busca y elimina todos los archivos de la carpeta previews
function deletePreviews (files){
    for (const file of files) {
        const filePath = path.join(previewsDirectory, file);
        fs.unlinkSync(filePath);
    }
}

//Busca y guarda una preview
function getPreview (){
    const url = document.getElementById('searchInput').value
    const img = document.getElementById('preview')
    const files = fs.readdirSync(previewsDirectory)
    
    //Elimina el elemento imagen de la preview anterior
    if (img) {
        img.remove() 
        download.style.display = 'none'
    }

    if (files.length > 0) deletePreviews(files)

    //Desactiva el boton de busqueda y emite la funcion de descargar una previev de la pagina
    if (url.length > 0) {
        loader.style.display = 'flex'
        searchButton.disabled = true;
        ipcRenderer.send('capture-screenshot-preview', url, previewsDirectory);
    }

    if (url.length == 0) handlerToast('Ingresa una url valida')
}

//Descarga la imagen en el formato seleccionado
function downloadScreenshot (){
    const format = document.getElementById('format').value
    const url = document.getElementById('searchInput').value
    
    //Emite el evento descargar 
    ipcRenderer.send('capture-screenshot', url, format);
}

//Emula a un react hottoast
function handlerToast (msg){
  const toastContainer = document.getElementById('toast-container');
  
  // Crear el elemento de la notificación
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;
  
  // Añadir la notificación al contenedor
  toastContainer.appendChild(toast);
  
  // Mostrar la notificación
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Ocultar la notificación después de 3 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

//
document.addEventListener('DOMContentLoaded', () => {
    const portafolio = document.getElementById('portafolio')
    searchButton = document.getElementById('searchButton')
    download = document.getElementById('download-section')
    downloadButton = document.getElementById('download-button')
    loader = document.getElementById('loader-container')
    download.style.display = 'none'

    searchButton.addEventListener('click', () => getPreview ())
    downloadButton.addEventListener('click', () => downloadScreenshot())
    portafolio.addEventListener('click', () => ipcRenderer.send('go-to-portafolio'))
});


//Muestra la preview descargada
ipcRenderer.on('preview-saved', (event, directory) => {
    const img = document.createElement('img')
    img.id = 'preview'
    img.src = directory

    searchButton.disabled = false;
    download.style.display = 'block'
    loader.style.display = 'none'

    document.getElementById('img-preview').appendChild(img)
});


//Dispara un toast para avisar que se ha descargado correctamente
ipcRenderer.on('screenshot-captured', (event, msg) => handlerToast(msg));