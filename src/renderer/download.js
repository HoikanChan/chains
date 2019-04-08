const { app, BrowserWindow,ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const mainWindow = require('../main/main.js');
const indexWin = require('../main/indexWin.js');

let downWin;

ipcMain.on('update-download',(event,download_data)=>{

    downWin = new BrowserWindow({
        width: 500,
        height: 400,
        minWidth: 500,
        minHeight: 400,
        show: false,
        title:"真才企链（test-base 0.0.1）",
        backgroundColor:"#fff",
        frame: false
      });

      downWin.once('show',function(){
        downWin.webContents.send('download-msg',download_data);
      })
    
      downWin.once('ready-to-show', () => {
        downWin.show();
        downWin.focus();
      });
    
      // and load the index.html of the app.
      downWin.loadURL(url.format({
        pathname: path.join(__dirname, '../../app/download.html'),
        protocol: 'file:'
      }));
    
      downWin.setMenu(null);
      // Open the DevTools.
      downWin.webContents.openDevTools();
    
      downWin.on('closed', function () {
        downWin = null;
      });

});

ipcMain.on('all-quit',function(){
  app.quit();
});

ipcMain.on('download-quit',function(){
  downWin.close();
});

ipcMain.on('download-min',function(){
  downWin.minimize();
});