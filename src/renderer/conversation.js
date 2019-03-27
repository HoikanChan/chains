const {app, ipcMain, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let option = {
    width: 300, 
    height: 450,
    maxWidth:300,
    maxHeight:450,
    minWidth:300,
    minHeight:450,
    show: false,
    backgroundColor:'#000',
    frame: false
};
let newwin;
ipcMain.on('add',(event,webim,selToID)=>
{
   if(newwin != null){
      newwin.focus();
      return;
   }
  newwin = new BrowserWindow(option)

  newwin.once('show',function(){
      newwin.webContents.send('synchronous-webim',webim,selToID);
  })

  newwin.once('ready-to-show', () => {
      newwin.show();
  });
  newwin.setMenu(null);

  newwin.loadURL(url.format({
    pathname: path.join(__dirname, '../../sections/conversation/video.html'),
    protocol: 'file:'
  }));

  newwin.webContents.openDevTools();
  newwin.on('closed',()=>{newwin = null})

})

ipcMain.on('join',(event,RoomID)=>
{
   if(newwin != null){
      newwin.focus();
      return;
   }
   newwin = new BrowserWindow(option)

   newwin.once('show',function(){
      newwin.webContents.send('synchronous-join',RoomID);
   })

   newwin.once('ready-to-show', () => {
      newwin.show();
   });
   newwin.setMenu(null);

   newwin.loadURL(url.format({
      pathname: path.join(__dirname, '../../sections/conversation/video.html'),
      protocol: 'file:'
   }));

    //newwin.webContents.openDevTools();
   newwin.on('closed',()=>{newwin = null})
})

ipcMain.on('voice-add',(event,webim,selToID)=>
{
   if(newwin != null){
      newwin.focus();
      return;
   }
   newwin = new BrowserWindow(option)

   newwin.once('show',function(){
      newwin.webContents.send('synchronous-voice',webim,selToID);
   })

   newwin.once('ready-to-show', () => {
      newwin.show();
   });
   newwin.setMenu(null);

   newwin.loadURL(url.format({
      pathname: path.join(__dirname, '../../sections/conversation/voice.html'),
      protocol: 'file:'
   }));

   newwin.webContents.openDevTools();
   newwin.on('closed',()=>{newwin = null});
})


ipcMain.on('voice-join',(event,RoomID)=>
{
   if(newwin != null){
      newwin.focus();
      return;
   }
   newwin = new BrowserWindow(option)

   newwin.once('show',function(){
      newwin.webContents.send('synchronous-voice-join',RoomID);
   })

   newwin.once('ready-to-show', () => {
      newwin.show();
   });
   newwin.setMenu(null);

   newwin.loadURL(url.format({
      pathname: path.join(__dirname, '../../sections/conversation/voice.html'),
      protocol: 'file:'
   }));

    // newwin.webContents.openDevTools();
   newwin.on('closed',()=>{newwin = null});
});

ipcMain.on('GroupMeeting',(event,webim,members)=>
{

   if(newwin != null){
      newwin.focus();
      return;
   }

   newwin = new BrowserWindow(option);

   newwin.once('show',function(){
      newwin.webContents.send('synchronous-webim', webim, members);
   })

   newwin.once('ready-to-show', () => {
      newwin.setMaximumSize(800,600);
      newwin.setMinimumSize(800,600);
      newwin.setSize(800,600);
      newwin.show();
   });
   newwin.setMenu(null);

   newwin.loadURL(url.format({
      pathname: path.join(__dirname, '../../sections/conversation/meeting.html'),
      protocol: 'file:'
   }));

   newwin.webContents.openDevTools();
   newwin.on('closed',()=>{newwin = null});
});



ipcMain.on('meeting-join',(event,RoomID)=>
{

   if(newwin != null){
      newwin.focus();
      return;
   }

   option['width'] = 800;
   option['height'] = 600;
   option['maxWidth'] = 800;
   option['maxHeight'] = 600;
   option['minWidth'] = 800;
   option['minHeight'] = 600;

   newwin = new BrowserWindow(option);

   newwin.once('show',function(){
      newwin.webContents.send('synchronous-join', RoomID);
   })

   newwin.once('ready-to-show', () => {
      newwin.show();
   });
   newwin.setMenu(null);

   newwin.loadURL(url.format({
      pathname: path.join(__dirname, '../../sections/conversation/meeting.html'),
      protocol: 'file:'
   }));

   newwin.webContents.openDevTools();
   newwin.on('closed',()=>{newwin = null});
});


//最小化
ipcMain.on('nw_min', e=> newwin.minimize());
//关闭
ipcMain.on('nw_close', e=> newwin.close());
