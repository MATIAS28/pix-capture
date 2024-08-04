const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow (){
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
          }
    })

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
}



app.on('ready', createWindow);


app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});