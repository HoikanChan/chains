ipcRenderer.on('conversation-msg',(event,msg)=>{
    webim.sendMsg(msg, function (resp) {
        console.log(resp);
    },function (err) {
        console.error(err);
    })
});

