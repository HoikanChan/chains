var index = {};
const {ipcRenderer:ipc} = require('electron');
const Mianwindow = remote.getCurrentWindow();

Testing();

$(document).ready(function(){
    $(document).bind("contextmenu",function(e){
        return false;
    });
});

$('<audio id="chatAudio" muted><source src="../assets/mp3/notify.ogg" type="audio/ogg"><source src="../assets/mp3/notify.mp3" type="audio/mpeg"><source src="../assets/mp3/notify.wav" type="audio/wav"></audio>').appendTo('body');

index.load = ()=>{

    $('body').on("dragstart",'img',function(){return false;}); 
    $('body').on("contextmenu",'img',function(){return false;});

    utility.currencyGetAjax('user/selectAllContacts',undefined,function(res){
        var arr = {};
        $.each(res.data,(i,item)=>{
            arr[item.userId] = item;
            db.set('chats.list',arr).write();
        });
    });

    $('.app-index-company-box').click(function(event){
        $('.app-index-company-list').show();
        event.stopPropagation();
    });

    $(document).click(function(){
        $('.app-chat-right-body').hide();
        $('.app-index-company-list').hide();
        $('.app-conversation-list').remove();
        $('#send_msg_text').focus();
    });

    $('#send_msg_text').click(function(){
        ipcRenderer.send('tray-canceltwinkle');
        $("#sessDiv_" + escapeJquery(selToID)).find('.app-chats-Tips').remove();
    });

    $(document).on('click','.layui-layer-close,input,.app-chat-float p,.app-chat-console-communication',function(event){
        event.stopPropagation();
    });

    $(document).on('click','#ne_setmin_btn',function(){
        Mianwindow.minimize();
    });
    
    $(document).on('click','#ne_close_btn',function(){
        ipc.send('tray-status');
        Mianwindow.hide();
    });

    $('.app-index-user-portrait').click(function(){
        let moduleId = 'userInfo';
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

    })

    $('.app-index-company-list').on('click','li',function(){
        let company_text = $(this).text();
        $('.app-index-company-box').text(company_text);
        $('.app-index-company-list').hide();
        $('.app-index-shade').hide();
    });
   
    utility.currencyAjax('post','user/info2?userId='+im.identifier,undefined,function(res){
        if(res.code === '000'){
            var userInfo = res.data;
            $('.app-index-user-nickname-text').text(userInfo.realName);
            $('.app-index-user-position').text(userInfo.position);
            var introduce = (userInfo.introduce != null)?userInfo.introduce:'未设置';
            $('.app-index-user-introduce').html('<p>'+introduce+'</p>');
            var  picUrl = fileDomain + userInfo.picUrl;
            if(userInfo.picUrl == null || userInfo.picUrl == ''){
                picUrl = (userInfo.sex == '女')?'../assets/images/6.png':'../assets/images/7.png';
            }
            userInfo.picUrl = picUrl;
            $('.app-index-user-portrait img').attr('src',picUrl);
            $('#app-setting-position').val(userInfo.position);
            $('#app-setting-nickname').val(userInfo.realName);
            $('#app-setting-phone').val(userInfo.contactPhone);
            $('#app-setting-introduce').val(introduce);
            $('#app-setting-header').find('img').attr('src',picUrl);
            db.set('user.details',res.data).write();
        }
    });

}

index.loadCompany = ()=>{
    $('.app-index-company-list').empty();
    let html = '';
    $.each(organs,(i,item)=>{
        if(i == 0){
            $('.app-index-company-box').text(item.organName);
        }
        html += `<li data-id='`+item.organId+`'>`+item.organName+`</li>`
    });
    $('.app-index-company-list').append(html);
}

index.load();
index.loadCompany();



