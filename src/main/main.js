// Modules to control application life and create native browser window
const {app, BrowserWindow, globalShortcut,ipcMain:ipc} = require('electron');
const glob = require("glob");
const path = require('path');
const url = require('url');
const indexWin = require('./indexWin.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow (status = false) {
  
  mainWindow = new BrowserWindow({
    width: 550,
    height: 400,
    minWidth: 550,
    minHeight: 400,
    maxWidth: 550,
    maxHeight: 400,
    show: false,
    title:"真才企链（test-base 0.0.1）",
    backgroundColor:"#fff",
    frame: false
  });

  mainWindow.once('show',function(){
    if(status == true){
      mainWindow.webContents.send('synchronous-msg','logout');
    }else{
      mainWindow.webContents.send('synchronous-msg','auto');
    }
  })

  mainWindow.once('ready-to-show', () => {
    if(status){
      indexWin.indexWin.close();
    }
    mainWindow.show();
    module.exports.mainWindow = mainWindow;
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../app/login.html'),
    protocol: 'file:'
  }));

  mainWindow.setMenu(null);
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // window.localStorage.clear();
    mainWindow = null;
  });

}

const gotTheLock = app.requestSingleInstanceLock();

if(gotTheLock){
  app.on('second-instance',(e,commandLine)=>{
    if(mainWindow){//登录窗口打开判断
      if(mainWindow.isMinimized())mainWindow.restore();
      mainWindow.focus();
    }
    if(indexWin.indexWin){//聊天窗口打开判断
      if(indexWin.indexWin.isMinimized())indexWin.indexWin.restore();
      indexWin.indexWin.focus();
    }
  })
  app.on('ready', ()=>{
      createWindow();
  })
}else{
  app.quit();
}

loadModule();

ipc.on('logout',(event, msg)=>{
  createWindow(true);
});

function loadModule () {
  const files = glob.sync(path.join(__dirname, '../renderer/*.js'));
  files.forEach((file) => { require(file) })
}

let sil = app.requestSingleInstanceLock();
if (!sil) {
    app.quit();
}

//关闭所有窗口后退出.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
      app.quit()
    }
})

//当应用被激活时(macOS)
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
