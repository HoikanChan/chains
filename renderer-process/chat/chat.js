var chat = {};

chat.index = '';

chat.init = ()=>{
}

chat.event = ()=>{

    $('#send-message').click(function(){
       var msg = $('#send_msg_text').text();
       if(msg){
         onSendMsg();
       }
    });

    $('#send_msg_text').keydown(function(event){
      var inputTxt = $(this);
      if (event && event.keyCode == 13 && !(event.ctrlKey)) {
          onSendMsg();
          event.preventDefault();
          return false;
      }

      if (event.ctrlKey && event.keyCode == 13) {
        inputTxt.html(inputTxt.html() + '<br>');
        return false;
      }
    });

    $('#check-file').click(function(){
      $('#upload_file').click();
    });

    $('#upload_file').change(function(){
      var file = $(this);
      var uploadFiles = file[0];
      var filesize = uploadFiles.files[0].size;
      if(checkPic(uploadFiles,filesize)){
        uploadPic(uploadFiles);
      }else{
        uploadFile(uploadFiles);
      }
    });

    $("#send_msg_text").emoji({
      button: "#app-expression",
      showTab: false,
      animation: 'fade',
      icons: [{
          name: "QQ表情",
          path: "../assets/images/qq/",
          maxNum: 90,
          file: ".png",
          placeholder: "#qq_{alias}#"
      }]
    });

    $('#app-video').click(function(){
      ipcRenderer.send('add',webim.ctx,selToID);
    });

    $('#app-voice').click(function(){
      ipcRenderer.send('voice-add',webim.ctx,selToID);
    });

    $('#app-chat-group-quit').click(function(){
      var id = $(this).attr('data-id');

      var str = '';
      if(id == '1'){
        str = '退出';
      }else{
        str = '解散';
      }

      layer.confirm('是否确认'+str+'该群', {
        btn: ['确定','取消'] //按钮
      }, function(){
        // if(id == '1'){
          webim.quitGroup({'GroupId': selToID},function(resp){
            layer.msg(str+'成功');
            $('#sessDiv_'+ escapeJquery(selToID)).remove();
            selToID = null;
            let sectionId = 'app-chat-section';
            document.getElementById(sectionId).classList.remove('is-shown');
          },function(e){
            console.log(e);
          });
        // }else{
          // webim.destroyGroup({'GroupId': selToID},function(resp){
          //   layer.msg('群解散成功');
          //   $('#sessDiv_'+ escapeJquery(selToID)).remove();
          //   selToID = null;
          //   let sectionId = 'app-chat-section';
          //   document.getElementById(sectionId).classList.remove('is-shown');
          // },function(e){
          //   console.log(e);
          // });
        // }
      }, function(){
      });

    });

    $('#app-chat-group-adduser').click(function(){
      chat.addGroupbox();
    });


    $('body').on('click','#app-chat-check-users .app-chat-friend-item',function(){
      var status = $(this).attr('data-status');
      var id = $(this).attr('data-id');
      if(status == '1'){
          var html = $(this).html();
          $(this).attr('data-status','2');
          $(this).find('i').removeClass('layui-icon-circle').addClass('layui-icon-circle-dot').css('color','#08979d');
          $('#app-chat-checked-users').append('<li id="app-chat-checked-user-'+id+'" data-id="'+id+'" class="app-chat-friend-item">'+html.replace('layui-icon-circle','layui-icon-close-fill')+'</li>');
      }else{
          $(this).attr('data-status','1');
          $(this).find('i').removeClass('layui-icon-circle-dot').addClass('layui-icon-circle').css('color','#000');
          $('#app-chat-checked-users #app-chat-checked-user-' + id).remove();
      }
    });

    $('body').on('click','#app-chat-checked-users .app-chat-friend-icon',function(){
      var id = $(this).parents('.app-chat-friend-item').attr('data-id');
      $(this).parents('.app-chat-friend-item').remove();
      $('#app-seach-check-user-'+id).find('i').removeClass('layui-icon-circle-dot').addClass('layui-icon-circle').css('color','#000');
      $('#app-seach-check-user-'+id).attr('data-status','1');
    });

    $('body').on('click','.app-chat-friend-cancel',function(){
        layer.close(chat.index);
    });

    $('body').on('click','#app-chat-createdGroup',function(){
      chat.created();
    });

}

chat.event();

chat.addGroupbox = ()=>{

    var friend = db.get('chats.list').value();
    var list = '';
    var $li = $('<li>'),$img = $('<img>'),$span = $('<span>');
    $.each(friend,(i,item)=>{
        var user_info =   db.get('group.userList.'+selToID).find({'userId':item.userId}).value();
        if(user_info){
          return true;
        }
        if(item.userId != user.im.identifier){
            var $li1 = $li.clone().addClass('app-chat-friend-item').attr({
                "data-status":'1',
                "data-id":item.userId,
                "id":"app-seach-check-user-"+item.userId,
            });
            var  picUrl = fileDomain + item.picUrl;
            if(item.picUrl == null || item.picUrl == ''){
                picUrl = (item.sex == '女')?'../assets/images/6.png':'../assets/images/7.png';
            }
            var $img1 = $img.clone().addClass('layui-circle').attr('src',picUrl);
            var $span1 = $span.clone().addClass('app-chat-friend-name').text(item.realName);
            $li1.append($img1).append($span1).append('<span class="app-chat-friend-icon"><i class="layui-icon layui-icon-circle"></i></span>');
            list += $li1.prop("outerHTML");
        }
    });

  var html = `<div class="check-box layui-form layui-low">
    <div class="layui-col-xs6">
        <div class="app-chat-friend-title">好友列表</div>
        <ul id="app-chat-check-users" class="app-chat-friend-list">
            `+list+`
        </ul>
    </div>
    <div class="layui-col-xs6">
        <div class="app-chat-friend-title">选择好友</div>
        <ul id="app-chat-checked-users" class="app-chat-friend-list">
        </ul>
    </div>
    <div class="app-chat-friend-console layui-col-xs12">
        <button id="app-chat-createdGroup" class="layui-btn layui-btn-sm" >确定</button>
        <button class="layui-btn layui-btn-primary layui-btn-sm app-chat-friend-cancel">取消</button>
    </div>
  </div>`;

  chat.index = layer.open({
    type: 1,
    title:'请勾选需要添加的联系人',
    skin: 'layui-layer-rim', //加上边框
    area: ['460px', '440px'], //宽高
    content: html
  });
}

chat.created = ()=>{
    var member_list = [];
    $('#app-chat-checked-users').find('.app-chat-friend-item').each(function(){
        member_list.push({"Member_Account":$(this).attr('data-id')});
    });

    if(member_list.length == 0){
        layer.msg('请选择添加群好友');
        return;
    }

    webim.addGroupMember(
      {
        "GroupId":selToID,
        "MemberList":  member_list
      },
      function (resp) {
        SetGroupInfo(selToID);
        layer.close(chat.index);
        layer.msg('好友邀请成功');
      },
      function (err) {
          console.log(err.ErrorInfo);
      }
  );

}

