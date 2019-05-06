$('.app-menu-list').on('click','li',function(){
    let listName = $(this).attr('data-section');
    if(listName == 'open-Mail'){
        // utility.currencyGetAjax('email/loginToAlmailUrl',undefined,function(res){
        //     if(res.code == '000'){
        //         shell.openExternal(res.data);
        //     }
        // });
        ipcRenderer.send('emailWin-show',{
            token: Token
        });

    }else if(listName == 'app-setting'){
        showSetting();
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
    }
}

function showSetting() {
    layer.open({
        type: 1,
        title: false,
        offset:['calc(100% - 200px)','12px'],
        skin: 'app-setting-options-box', //样式类名
        shade: [0.1, '#fff'],
        closeBtn: 0, //不显示关闭按钮
        anim: 2,
        shadeClose: true, //开启遮罩关闭
        content: '<ul class="app-setting-options-list"><li class="app-setting-option-item" id="userInfo">个人信息</li><li class="app-setting-option-item" id="resetPsw">设置密码</li><li class="app-setting-option-item" id="app-testing">版本检测</li><li class="app-setting-option-item" id="app-logout">退出登录</li></ul>'
    });
    $('.app-setting-options-list').on("click",'.app-setting-option-item',function(){
        const moduleId =  $(this).attr('id')
        layer.closeAll()
        if(moduleId == 'app-logout' || moduleId == 'app-testing'){
            return;
        }
        if(moduleId == "userInfo"){
            initUserInfoModal();
        }
        const link = document.querySelector(`link#${moduleId}[rel="import"]`);
        const template = link.import.querySelector('.modal-template')
        let clone = document.importNode(template.content, true)
        layer.open({
            type: 1,
            title: false,
            offset:['10%','20%'],
            skin: 'app-setting-modals-box', //样式类名
            shade: [0.1, '#fff'],
            closeBtn: 0, //不显示关闭按钮
            anim: 2,
            shadeClose: true, //开启遮罩关闭
            content: '<div class="setting-modal"></div>'
        });
         document.querySelector('.setting-modal').appendChild(clone)

        if(moduleId == "userInfo"){
            initUserInfoModal();
        }
    })
}

function initUserInfoModal() {
    utility.currencyAjax('post','user/info2?userId='+im.identifier,undefined,function(res){
        if(res.code === '000'){
            var userInfo = res.data;
            var  picUrl = fileDomain + userInfo.picUrl;
            if(userInfo.picUrl == null || userInfo.picUrl == ''){
                picUrl = (userInfo.sex == '女')?'../../assets/images/6.png':'../../assets/images/7.png';
            }
            userInfo.picUrl = picUrl;
            $(`.app-setting-modals-box .app-setting-sex[title="${userInfo.sex}"]`).prop("checked","checked")

            $('.app-setting-modals-box .app-index-user-portrait img').attr('src',picUrl);
            $('.app-setting-modals-box #app-setting-nickname').val(userInfo.realName);
            $('.app-setting-modals-box #app-setting-phone').val(userInfo.contactPhone);
            
            $('.app-setting-modals-box #app-setting-position').text(userInfo.position);
            $('.app-setting-modals-box #app-setting-company').text(organs[0].organName);
            $('.app-setting-modals-box #app-setting-dept').text(userInfo.depts[0].deptName);
            $('.app-setting-modals-box #app-setting-header').find('img').attr('src',picUrl);
        }
    });
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
    if(idNmae == 'hailfellow-list'){
        let sectionId = 'app-hailfellow-section';
        let hai_id = $('#'+sectionId).attr('data-id');
        if(hai_id){
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
    hailfellow.hailfellow.Menuload();
    callback(idNmae);
}
function interviewList(idNmae,callback){
    callback(idNmae);
}