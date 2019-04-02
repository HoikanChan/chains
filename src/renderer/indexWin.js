const { app, BrowserWindow,globalShortcut,ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const ShortcutCapture =  require('shortcut-capture');
const mainWindow = require('../main/main.js');

let $indexWin;
let downloadpath;//下载路径

ipcMain.on('login',()=>{

  $indexWin = new BrowserWindow({
      width: 900, 
      height: 600,
      minWidth: 900,
      minHeight: 600,
      show: false,
      title:"真才企链（test-base 0.0.1）",
      backgroundColor:"#fff",
      frame: false
    });
  
    const shortcutCapture = new ShortcutCapture({
      isUseClipboard:true
    });
  
    globalShortcut.register('ctrl+shift+z', () => shortcutCapture.shortcutCapture());
    globalShortcut.register('f12', () =>  $indexWin.openDevTools());

  
    $indexWin.once('ready-to-show', () => {
      mainWindow.mainWindow.close();
      $indexWin.show();
      $indexWin.focus();
    });
  
    // and load the index.html of the app.
    $indexWin.loadURL(url.format({
      pathname: path.join(__dirname, '../../app/index.html'),
      protocol: 'file:'
    }));
  
    $indexWin.setMenu(null);
    // Open the DevTools.
    $indexWin.webContents.openDevTools();
  
    $indexWin.on('closed', function () {
      $indexWin = null;
    });
})

ipcMain.on('download', (event, args) => {
  var arr=args.split("+");
  downloadpath=arr[0];
  savepath=arr[1];
  //下载
  $indexWin.webContents.downloadURL(downloadpath);
});

ipcMain.on('screenshot',(event, msg)=>{
  const shortcutCapture = new ShortcutCapture({
    isUseClipboard:true
  });
  shortcutCapture.shortcutCapture();

  shortcutCapture.on('capture', ({dataURL, bounds}) => 
    $indexWin.webContents.send('shortcut',dataURL)
  )
});
