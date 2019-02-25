
var index = {};
const {ipcRenderer:ipc} = require('electron');

$('#ne_setmin_btn').click(function(){
    ipc.send('ne_min');
});
$('#ne_close_btn').click(function(){
    ipc.send('ne_close');
    ipc.send('nw_close');
});

$(document).ready(function(){
    $(document).bind("contextmenu",function(e){
        return false;
    });
});

$('<audio id="chatAudio" muted><source src="../assets/mp3/notify.ogg" type="audio/ogg"><source src="../assets/mp3/notify.mp3" type="audio/mpeg"><source src="../assets/mp3/notify.wav" type="audio/wav"></audio>').appendTo('body');

index.load = ()=>{

    utility.currencyGetAjax('user/selectAllContacts',undefined,function(res){
        var arr = {};
        $.each(res.data,(i,item)=>{
            arr[item.userId] = item;
            db.set('chats.list',arr).write();
        });
    });

    utility.currencyAjax('post','user/info2?userId='+im.identifier,undefined,function(res){
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
        $('#app-setting-phone').val(userInfo.phone);
        $('#app-setting-introduce').val(introduce);
        $('#app-setting-header').find('img').attr('src',picUrl);
        db.set('user.details',res.data).write();
    });

}

index.load();
