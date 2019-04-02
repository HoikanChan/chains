const {app, ipcMain, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let option = {
    width: 450, 
    height: 400,
    maxWidth:450,
    maxHeight:400,
    minWidth:450,
    minHeight:400,
    show: false,
    backgroundColor:'#fff',
    frame: false,
    icon: __dirname + '/icon.ico',
};
let resetPswWin;
ipcMain.on('resetPsw-open',(event)=>
{

  if(resetPswWin != null){
    resetPswWin.focus()
    return;
  }

  resetPswWin = new BrowserWindow(option)

  resetPswWin.once('ready-to-show', () => {
     resetPswWin.show();
  });
  resetPswWin.setMenu(null);

//   resetPswWin.once('show',function(){
//     resetPswWin.webContents.send('synchronous-webim');
//  })

  resetPswWin.loadURL(url.format({
    pathname: path.join(__dirname, '../../sections/setting/resetPsw.html'),
    protocol: 'file:'
  }));

  resetPswWin.webContents.openDevTools();
  resetPswWin.on('closed',()=>{resetPswWin = null})
})
//关闭
ipcMain.on('resetPswWin_close', e=> resetPswWin.close());