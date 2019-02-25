const {app, ipcMain, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let option = {
    show: false,
    backgroundColor:'#000',
    title: '',
    icon: __dirname + '/icon.ico',
};
let resumewin;
ipcMain.on('interviewer-complete',(event,complete)=>
{
  option.title = complete.username+"的个人简历";
  resumewin = new BrowserWindow(option)

  resumewin.once('show',function(){
    resumewin.webContents.send('synchronization',complete);
  })

  resumewin.once('ready-to-show', () => {
     resumewin.maximize()
     resumewin.show();
  });
  resumewin.setMenu(null);

  resumewin.loadURL(url.format({
    pathname: path.join(__dirname, '../../sections/resume/resume.html'),
    protocol: 'file:'
  }));

  resumewin.webContents.openDevTools();
  resumewin.on('closed',()=>{resumewin = null})
})
