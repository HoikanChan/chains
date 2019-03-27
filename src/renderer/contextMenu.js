const {app, BrowserWindow, Menu, ipcMain }  = require('electron');

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
  const template = Object.keys(menuCmd)
    .map(cmd => {
      const { id, label } = menuCmd[cmd]
      let enabled = true
      let visible = true
      return {
        id,
        label,
        role: cmd,
        enabled,
        visible
      }
    })
    .filter(item => item.visible)
    .sort((a, b) => a.id > b.id)

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
