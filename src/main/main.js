// Modules to control application life and create native browser window
const {app, BrowserWindow, globalShortcut,ipcMain:ipc} = require('electron');
const glob = require("glob");
const path = require('path');
const url = require('url');
const ShortcutCapture =  require('shortcut-capture');
const request = require('request');

const appVersion = require('../../package.json').version;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow,downloadWin;

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

    if(downloadWin){//更新窗口打开判断
      if(downloadWin.isMinimized())downloadWin.restore();
      downloadWin.focus();
    }
  })
  app.on('ready', ()=>{
    // request.get({
    //     url:'http://company.zqyzk.com/api/v1/versions/getLastVersion?type=0',
    //     json: true
    // },function(error, response, body){
    //   if(body && body.code === "000"){
    //     let data = body.data;
    //     let version = appVersion.split('.');
    //     let new_version = data.version.split('.');
    //     if (version[0] < new_version[0] || version[1] < new_version[1] || version[2] < new_version[2]) {
    //       downloadWindow(data);
    //     }else{
          createWindow();
    //     }
    //   }
    // });
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

ipc.on('download-quit',function(){
  app.quit();
});

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
