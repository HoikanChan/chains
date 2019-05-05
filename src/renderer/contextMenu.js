const {app, BrowserWindow, Menu, ipcMain }  = require('electron');
const indexWin = require('../main/indexWin.js');

function menuList($win, params){
  // 菜单执行命令
  const menuCmd = {
    copy: {
      id: 1,
      label: '复制'
    },
    cut: {
      id: 2,
      label: '剪切'
    },
    paste: {
      id: 3,
      label: '粘贴'
    },
    selectall: {
      id: 4,
      label: '全选'
    }
  }

  // 生成菜单模板
  const template = [
    { label: "全选", accelerator: "CommandOrControl+A", role: "selectAll" },
    { label: "复制", accelerator: "CommandOrControl+C", role: "copy" },
    { label: "剪切", accelerator: "CommandOrControl+X", role: "cut" },
    { label: "粘贴", accelerator: "CommandOrControl+V", click: ()=> indexWin.indexWin.webContents.send('paste-other') }
  ]

  // 用模板生成菜单
  if (template.length && !$win.isDestroyed()) {
    const menu = Menu.buildFromTemplate(template)
    menu.popup($win)
  }
}

ipcMain.on('show-context-menu', (event,params) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  menuList(win)
});

