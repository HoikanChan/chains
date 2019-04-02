const {app, ipcMain, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let option = {
    show: false,
    title: '',
    icon: '',
};
let imagewin;
ipcMain.on('inmage-show',(event,img)=>
{
  if(imagewin != null){
    imagewin.loadURL(img);
    imagewin.focus();
    return;
  }

  imagewin = new BrowserWindow(option)

  imagewin.once('ready-to-show', () => {
     imagewin.show();
  });
  imagewin.setMenu(null);

  imagewin.loadURL(img);

  imagewin.on('closed',()=>{imagewin = null})
})
