const {app, ipcMain, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let option = {
    width: 650, 
    height: 500,
    maxWidth:650,
    maxHeight:500,
    minWidth:650,
    minHeight:500,
    show: false,
    backgroundColor:'#fff',
    frame: false,
    icon: __dirname + '/icon.ico',
};
let searchwin;
ipcMain.on('search-open',(event)=>
{
  searchwin = new BrowserWindow(option)

  searchwin.once('ready-to-show', () => {
     searchwin.show();
  });
  searchwin.setMenu(null);

  searchwin.loadURL(url.format({
    pathname: path.join(__dirname, '../../sections/search/search.html'),
    protocol: 'file:'
  }));

  searchwin.webContents.openDevTools();
  searchwin.on('closed',()=>{searchwin = null})
})

//最小化
ipcMain.on('se_min', e=> searchwin.minimize());
//关闭
ipcMain.on('se_close', e=> searchwin.close());