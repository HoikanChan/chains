const {app, BrowserWindow, globalShortcut,ipcMain:ipc} = require('electron');
const url = require('url');
const path = require('path');

let emailWindow
ipc.on('emailWin-show',(event, msg)=>{
    emailWindow = new BrowserWindow({
     width: 900, 
        height: 600,
        minWidth: 900,
        minHeight: 600,
      show: false,
      title:"真才企链邮箱",
      backgroundColor:"#fff",
      frame: false
    });
  
    emailWindow.once('show',function(){
        emailWindow.webContents.send('synchronous-data', msg);
    })
  
    emailWindow.once('ready-to-show', () => {
      emailWindow.show();
      module.exports.emailWindow = emailWindow;
    });
  
    // and load the index.html of the app.
    emailWindow.loadURL(url.format({
      pathname: path.join(__dirname, '../../sections/email/index.html'),
      protocol: 'file:'
    }));
  
    emailWindow.setMenu(null);
    // Open the DevTools.
    emailWindow.webContents.openDevTools();
  
    // Emitted when the window is closed.
    emailWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      // window.localStorage.clear();
      emailWindow = null;
    });
  });