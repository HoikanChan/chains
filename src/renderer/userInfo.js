const {app, ipcMain, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let option = {
    width: 450, 
    height: 500,
    maxWidth:450,
    maxHeight:500,
    minWidth:450,
    minHeight:500,
    show: false,
    backgroundColor:'#fff',
    frame: false,
    icon: __dirname + '/icon.ico',
};
let userInfowin;
ipcMain.on('userInfo-open',(event,userInfo)=>
{

  if(userInfowin != null){
    userInfowin.focus()
    return;
  }

  userInfowin = new BrowserWindow(option)

  userInfowin.once('ready-to-show', () => {
     userInfowin.show();
  });
  userInfowin.setMenu(null);

  userInfowin.once('show',function(){
    userInfowin.webContents.send('synchronous-webim',userInfo);
 })

  userInfowin.loadURL(url.format({
    pathname: path.join(__dirname, '../../sections/setting/userInfo.html'),
    protocol: 'file:'
  }));

  userInfowin.webContents.openDevTools();
  userInfowin.on('closed',()=>{userInfowin = null})
})
//关闭
ipcMain.on('userInfowin_close', e=> userInfowin.close());