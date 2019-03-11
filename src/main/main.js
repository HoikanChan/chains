// Modules to control application life and create native browser window
const {app, BrowserWindow, globalShortcut, clipboard, nativeImage} = require('electron');
const ipc = require('electron').ipcMain
const glob = require("glob");
const path = require('path');
const url = require('url');
const ShortcutCapture =  require('shortcut-capture');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let newWindow;

function createWindow (status = false) {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 650, 
    height: 450,
    minWidth: 650,
    minHeight: 450,
    maxWidth: 650,
    maxHeight: 450,
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
    if(newWindow){
      newWindow.close();
    }
    mainWindow.show();
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../app/login.html'),
    protocol: 'file:'
  }));

  mainWindow.setMenu(null);
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  require('devtron').install()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // window.localStorage.clear();
    mainWindow = null;
  });

}

//最小化
ipc.on('min', e=> mainWindow.minimize());
//关闭
ipc.on('close', e=> mainWindow.close());

//最小化
ipc.on('ne_min', e=> newWindow.minimize());
//关闭
ipc.on('ne_close', e=> newWindow.close());

ipc.on('reduction',()=>
{
  mainWindow.setSize(650,450);
})

loadModule();

ipc.on('login',()=>
{
  newWindow = new BrowserWindow({
    width: 850, 
    height: 550,
    minWidth: 850,
    minHeight: 550,
    maxWidth: 850,
    maxHeight: 550,
    show: false,
    title:"真才企链（test-base 0.0.1）",
    backgroundColor:"#fff",
    frame: false
  });

  const shortcutCapture = new ShortcutCapture({
    isUseClipboard:true
  });

  globalShortcut.register('ctrl+shift+z', () => shortcutCapture.shortcutCapture());

  shortcutCapture.on('capture', ({dataURL, bounds}) => 
    clipboard.writeImage(nativeImage.createFromDataURL(dataURL))
  )

  newWindow.once('ready-to-show', () => {
    mainWindow.close();
    newWindow.show();
  });

  // and load the index.html of the app.
  newWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../app/index.html'),
    protocol: 'file:'
  }));

  newWindow.setMenu(null);
  // Open the DevTools.
  newWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  newWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // window.localStorage.clear();
    newWindow = null;
  });

});


ipc.on('logout',(event, msg)=>{
  createWindow(true);
});

ipc.on('screenshot',(event, msg)=>{
  const shortcutCapture = new ShortcutCapture({
    isUseClipboard:true
  });
  shortcutCapture.shortcutCapture();

  shortcutCapture.on('capture', ({dataURL, bounds}) => 
    newWindow.webContents.send('shortcut',dataURL)
  )
});

let downloadpath;//下载路径
ipc.on('download', (event, args) => {
  var arr=args.split("+");
  downloadpath=arr[0];
  savepath=arr[1];
  //下载
  newWindow.webContents.downloadURL(downloadpath);
});

function loadModule () {
  const files = glob.sync(path.join(__dirname, '../renderer/*.js'));
  files.forEach((file) => { require(file) })
}

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
// 调用方发生事件.
app.on('ready', createWindow)

//关闭所有窗口后退出.
app.on('window-all-closed', function () {
    app.quit();
})

//当应用被激活时(macOS)
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
