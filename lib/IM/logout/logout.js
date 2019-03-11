//退出
function quitClick() {
    if (loginInfo.identifier) {
        //sdk登出
        webim.logout(
            function (resp) {
                loginInfo.identifier = null;
                loginInfo.userSig = null;
                document.getElementById("webim_demo").style.display = "none";
                var indexUrl = window.location.href;
                var pos = indexUrl.indexOf('?');
                if (pos >= 0) {
                    indexUrl = indexUrl.substring(0, pos);
                }
                window.location.href = indexUrl;
            }
        );
    } else {
        alert('未登录');
    }
}

//被新实例踢下线的回调处理
function onKickedEventCall(){
    layer.open({
        content: '账号已在其他地方登陆',
        scrollbar: false,
        yes:function(){
            ipcRenderer.send('logout');
        }
    });
   // document.getElementById("webim_demo").style.display = "none";
}

//多终端登录被T
function onMultipleDeviceKickedOut() {
    layer.open({
        content: '账号已在其他地方登陆',
        scrollbar: false,
        yes:function(){
            ipcRenderer.send('logout');
        }
    });
    //document.getElementById("webim_demo").style.display = "none";
}

