const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const puppeteer = require('puppeteer');
const path = require('path')

//Crea la ventana principal de la aplicacion
function createWindow (){
    const mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
          }
    })

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
}

// Espera a que la app este lista para crear la ventana
app.whenReady().then(() => {
  createWindow()
})

//Busca, captura y descarga una preview de la url especificada
ipcMain.on('capture-screenshot-preview', async (event, url, previewsDirectory) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage({
    defaultViewport: {
      width: 480,
      height: 240
    }
  });
  

  try {
    await page.goto(url);
    const screenshotPath = path.join(previewsDirectory, `preview-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, type: 'png', fullPage: false});
    

    await browser.close();
    event.reply('preview-saved', screenshotPath);
  } catch (e) {
    console.log(e);
  }
});


//Busca, captura y descarga una captura con un formato específico
ipcMain.on('capture-screenshot', async (event, url, format) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  

  try {
    await page.goto(url);

    //Abre el cuadro de dialogo para especificar la ruta donde se va a guardar
    const result = await dialog.showSaveDialog({
      title: 'Save Screenshot',
      defaultPath: path.join(app.getPath('downloads'), `screen.${format}`),
      filters: [{ name: 'Images', extensions: [format] }]
    });

    //Verifica el formato seleccionado
    if (format === 'pdf') {
      await page.pdf({ path: result.filePath, type: format});
    }else{
      await page.screenshot({ path: result.filePath, type: format});
    }

    await browser.close();

    //Verifica si no ha cancelado la descarga y dispara un toast para avisar que se descargo con exito
    if (!result.canceled) event.reply('screenshot-captured', 'La imagen se ha descargado con éxito');
  } catch (e) {
    console.log(e);
  }
});


//Crea una nueva ventana para mostrar el portafolio
ipcMain.on('go-to-portafolio', () => {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
})

  mainWindow.loadURL('https://www.matiasmuñoz.site/')
})