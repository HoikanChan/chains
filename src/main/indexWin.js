const {app, BrowserWindow, globalShortcut, ipcMain, Menu, Tray, shell, clipboard} = require('electron');
const path = require('path');
const url = require('url');
const mainWindow = require('./main.js');
const child = require('child_process');

let $indexWin;
let downloadpath;//下载路径
var apptray = null;

ipcMain.on('login',()=>{

  $indexWin = new BrowserWindow({
      width: 900, 
      height: 600,
      minWidth: 900,
      minHeight: 600,
      show: false,
      title:"真才企链（test-base 0.0.1）",
      backgroundColor:"#fff",
      frame: false
    });
  
    globalShortcut.register('ctrl+shift+z', () => shortcutCapture(true));
    globalShortcut.register('f12', () =>  $indexWin.openDevTools());

    $indexWin.once('ready-to-show', () => {
      mainWindow.mainWindow.close();
      $indexWin.show();
      $indexWin.focus();
      apptray = creatTray();
      module.exports.indexWin = $indexWin;
    });

    // and load the index.html of the app.
    $indexWin.loadURL(url.format({
      pathname: path.join(__dirname, '../../app/index.html'),
      protocol: 'file:'
    }));
  
    $indexWin.setMenu(null);
    // Open the DevTools.
    $indexWin.webContents.openDevTools();
  
    $indexWin.on('closed', function () {
      $indexWin = null;
    });
})

ipcMain.on('download', (event, args) => {
  var arr=args.split("+");
  downloadpath=arr[0];
  savepath=arr[1];
  //下载
  $indexWin.webContents.downloadURL(downloadpath);
});

ipcMain.on('screenshot',(event)=>{//截屏
  shortcutCapture();
});

function shortcutCapture(status = false){

  var screenShotExePath = path.join(__dirname, "../../assets/screenshot/NiuniuCapture.exe");
       
  child.execFile(screenShotExePath, function (err, data) {
      if (err.code == 1 && status == false) {  //完成截图
          finishShot(err.code);
      }
  });

}

function finishShot(code){
    let nativeImage = clipboard.readImage('selection');
    if (nativeImage.getSize().width > 0) //粘贴图片
    {
        var image = clipboard.readImage();
        let nativeImageSrc = image.toDataURL();
        $indexWin.webContents.send('shortcut',nativeImageSrc);
    }
}

ipcMain.on('Frame_status',()=>{//窗口闪烁
  $indexWin.showInactive();
  $indexWin.flashFrame(true);
});

function creatTray(){

  let icon_file = path.join(__dirname, '../../assets/images/tray/tray.png');

  tray = new Tray(icon_file)
  const contextMenu =  Menu.buildFromTemplate([
      {
        label: '显示窗口',
        click: () => {
          $indexWin.show()
        }
      },
      {
        label: '退出',
        click: () => app.quit()
      }
    ])
  tray.setToolTip('真才企链')
  tray.setContextMenu(contextMenu)
  tray.on('click', () =>  openWin())
  tray.on('double-click', () => openWin())

  return tray;
}

ipcMain.on('tray-status',()=>{
  if(apptray){
    if(apptray.isDestroyed()){
      creatTray()
    }
  }
});

var count=0,timer = null;
ipcMain.on('tray-twinkle',()=>{
  if(!timer){
    timer = setInterval(function() {
        count++;
        if (count%2 == 0) {
          apptray.setImage(path.join(__dirname, '../../assets/images/tray/tray.png'));
        } else {
          apptray.setImage(path.join(__dirname, '../../assets/images/tray/tray1.png'));
        }
    }, 600);
  }

});

function openWin(){
  if(!!timer){
    clearInterval(timer)
    timer = null;
    apptray.setImage(path.join(__dirname, '../../assets/images/tray/tray.png'));
  }
  //主窗口显示隐藏切换
  $indexWin.isVisible() ? $indexWin.hide() : $indexWin.show();
}

ipcMain.on('tray-canceltwinkle',()=>{
  if(!!timer){
    clearInterval(timer)
    timer = null;
    apptray.setImage(path.join(__dirname, '../../assets/images/tray/tray.png'));
  }
});
