const settings = require('electron-settings');

$('.app-menu-list').on('click','li',function(){
    let listName = $(this).attr('data-section');
    if(listName == 'open-Mail'){
        utility.currencyGetAjax('email/loginToAlmailUrl',undefined,function(res){
            if(res.code == '000'){
                shell.openExternal(res.data);
            }
        });
    }else{
        ListShowMain(listName);
        $(this).addClass('is-selected');
    }
})

function ListShowMain(idNmae){
    hideAllUlAndDeselectButtons();
    switch (idNmae) {
        case 'chats-list':
            chatsList(idNmae,showList);
            break;
        case 'hailfellow-list':
            hailfellowList(idNmae,showList);
            break;
        case 'interview-list':
            interviewList(idNmae,showList);
            break;
        case 'app-logout':
            ipcRenderer.send('logout');
            break;
        case 'app-setting':
            layer.open({
                type: 1,
                title: false,
                offset:['73%','12px'],
                skin: 'app-setting-options-box', //样式类名
                shade: [0.1, '#fff'],
                closeBtn: 0, //不显示关闭按钮
                anim: 2,
                shadeClose: true, //开启遮罩关闭
                content: '<ul class="app-setting-options-list"><li class="app-setting-option-item" id="userInfo">个人信息</li><li class="app-setting-option-item" id="resetPsw">设置密码</li><li class="app-setting-option-item">版本更新</li></ul>'
            });
            $('.app-setting-options-list').on("click",'.app-setting-option-item',function(){
                const moduleId =  $(this).attr('id')
                layer.closeAll()
                ipcRenderer.send(`${moduleId}-open`, {userId: im.identifier,organs: organs[0]});
            })
            break;
    }

}

function showList(idNmae){
    $('#'+idNmae).removeClass('is-hidden');
    $('#'+idNmae).addClass('is-show');
    if(idNmae == 'chats-list'){
        if(selToID != null){
            let sectionId = 'app-chat-section';
            document.getElementById(sectionId).classList.add('is-shown');
        }
    }
}

function hideAllUlAndDeselectButtons(){
    const list = document.querySelectorAll('.is-show')
    Array.prototype.forEach.call(list, (section) => {
        section.classList.remove('is-show')
        section.classList.add('is-hidden')
    })

    const buttons = document.querySelectorAll('.nav-button.is-selected')
    Array.prototype.forEach.call(buttons, (button) => {
        button.classList.remove('is-selected')
    })

    const sections = document.querySelectorAll('.app-section.is-shown');
    Array.prototype.forEach.call(sections, (section) => {
      section.classList.remove('is-shown');
    })
}

function chatsList(idNmae,callback){
    callback(idNmae);
}
function hailfellowList(idNmae,callback){
    callback(idNmae);
}
function interviewList(idNmae,callback){
    callback(idNmae);
}