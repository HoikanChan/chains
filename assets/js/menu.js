const settings = require('electron-settings');

$('.app-menu-list').on('click','li',function(){
    let listName = $(this).attr('data-section');
    if(listName == 'app-addFriend'){
        ipcRenderer.send('search-open',webim.ctx);
    }else{
        ListShowMain(listName);
        $(this).addClass('is-selected');
    }

    if(listName == 'chats-list'){
        
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
            let sectionId = `app-setting-section`;
            document.getElementById(sectionId).classList.add('is-shown')
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