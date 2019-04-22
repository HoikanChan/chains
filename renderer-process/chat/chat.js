var chat = {};
const fs  = require('fs');

chat.index = '';
chat.shortcutImage = '';

chat.init = ()=>{
}

ipcRenderer.on('shortcut',(event,dataURL)=>{//截图显示
    if(chat.shortcutImage == dataURL){
      return;
    }
    chat.shortcutImage = dataURL;
    $('#send_msg_text').append($('<img>').css({"width":130,"height":60}).attr('src',dataURL));
    $('#send-message').attr("disabled",false);
});

chat.event = ()=>{

    $('#send-message').click(function(){//消息发送
      chat.sendMsg();
    });

    $('#send_msg_text').keydown(function(event){//消息快捷键
      var inputTxt = $(this);
      if (event && event.keyCode == 13 && !(event.ctrlKey)) {
          chat.sendMsg();
          event.preventDefault();
          return false;
      }

      if (event.ctrlKey && event.keyCode == 13) {
        inputTxt.html(inputTxt.html() + '<br>');
        woohecc.placeCaretAtEnd(inputTxt.get(0));
        return false;
      }

      if(event.keyCode == 8){
        if(formData.formData){
            setTimeout(function(){
              var image_num = $('#send_msg_text').find('.file_image').length;
              if(image_num < formData.formData.length){
                  formData.formData.pop();
              }
            },10);
        }
      }
      
      if(event.ctrlKey && event.keyCode  == 86) {  
        let base64_image = clipboard.readImage().toDataURL();
        let copy_text = clipboard.readText();
        
        
        const filePath = clipboard.readBuffer('FileNameW').toString('ucs2').slice(0, -1)
        if(filePath){
          const fileName = filePath.split('\\').pop().trim();
          const readPath = filePath.replace(/\\/g, '/')

          fs.readFile(filePath, function(err,data){
            const file = new File(data, fileName)
            window.renderFile(file)
          })
        }
        // let copy_text = clipboard.readBUffer();
        if(!clipboard.readImage().isEmpty()){
          $(this).append($('<img>').css({"width":130,"height":60}).attr('src',base64_image));
          $('#send-message').attr("disabled",false);
        }else{
          $(this).append(copy_text);
          $('#send-message').attr("disabled",false);
        }
        return false;  
      }

    });

    $('#check-file').click(function(){//文件选择
      $('#upload_file').click();
    });

    $('#upload_file').change(function(){//文件发送
      var file = $(this);
      var uploadFiles = file[0];
      var filesize = uploadFiles.files[0].size;
      if(checkPic(uploadFiles,filesize)){
        uploadPic(uploadFiles);
      }else{
        uploadFile(uploadFiles);
      }
    });

    $('body').on('click','#app-video',function(event){//视频通话
      event.stopPropagation();
      $('.app-conversation-list').remove();
      ipcRenderer.send('add',webim.ctx,selToID);
    });

    $('body').on('click','#app-voice',function(){//音频通话
      event.stopPropagation();
      $('.app-conversation-list').remove();
      ipcRenderer.send('voice-add',webim.ctx,selToID);
    });

    $('#app-meeting').click(function(){
      chat.Choicepersonnel();
    });

    $("#send_msg_text").emoji({//消息表情
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

    $('#app-chat-group-quit').click(function(){//解散\退出群组
      var status = $(this).attr('data-status');

      var str = '';
      if(status == '1'){
        str = '退出';
      }else{
        str = '解散';
      }

      layer.confirm('是否确认'+str+'该群', {
        btn: ['确定','取消'] //按钮
      }, function(){
        if(status == '1'){
          webim.quitGroup({'GroupId': selToID},function(resp){
            layer.msg(str+'成功');
            $('#sessDiv_'+ escapeJquery(selToID)).remove();
            selToID = null;
            let sectionId = 'app-chat-section';
            document.getElementById(sectionId).classList.remove('is-shown');
          },function(e){
            console.log(e);
          });
        }else{
          webim.destroyGroup({'GroupId': selToID},function(resp){
            layer.msg('群'+str+'成功');
            $('#sessDiv_'+ escapeJquery(selToID)).remove();
            selToID = null;
            let sectionId = 'app-chat-section';
            document.getElementById(sectionId).classList.remove('is-shown');
          },function(e){
            console.log(e);
          });
        }
      }, function(){
      });

    });

    $('#app-chat-sendMail').click(function(){//邮箱跳转
      utility.currencyGetAjax('email/loginToAlmailUrl',undefined,function(res){
        if(res.code == '000'){
          shell.openExternal(res.data);
        }
      });
    });

    // $('#app-record').click(function(){
    //   moduleId = 'invitation';
    //   const link = document.querySelector(`link#${moduleId}[rel="import"]`);
    //   const template = link.import.querySelector('.modal-template')
    //   let clone = document.importNode(template.content, true);
    //   layer.open({
    //     type: 1,
    //     title: false,
    //     skin: false, //加上边框
    //     area: ['340px', '420px'], //宽高
    //     closeBtn: 0, //不显示关闭按钮
    //     shadeClose: true, //开启遮罩关闭
    //     content: '<div class="invitation-modal"></div>'
    //   });
    //   document.querySelector('.invitation-modal').appendChild(clone)
    // });

    $('#app-chat-search-group-user-input').bind('input propertychange', function(){
        // let name = $(this).val();
    })

    $('#app-screenshot').click(function(e){//截图窗口
      ipcRenderer.send('screenshot');
    });

    $('#send_msg_text').focus(function(){//聊天窗口焦点事件
      $('.app-chat-left-footer').css('background','#FFF');
    }).blur(function(){
      $('.app-chat-left-footer').css('background','#EDEDED');
    });

    $('#send_msg_text').bind('input propertychange',function(){//聊天窗口输入事件
      let value = $(this).html();

      if(value.length > 0){
        $('#send-message').attr("disabled",false);
      }else{
        $('#send-message').attr("disabled","disabled");
      }
      
      if(value.length == 4){//判断换行删除
        var br = $('#send_msg_text').html();
        if(br=="<br>"){
          $('#send_msg_text').html("");
          $("#send_msg_text em").html("600");
          $('#send-message').attr("disabled","disabled");
        }
      }

    });

    $('#app-conversation').click(function(){
      let html = `
        <ul class="app-conversation-list">
          <li id="app-voice">语音通话</li>
          <li id="app-video">视频通话</li>
        </ul>
      `;
      $('body').append(html)
    });


    $("#send_msg_text").mousedown(function(e){//鼠标事件
      if(e.which == 3){  // 1 = 鼠标左键 left; 2 = 鼠标中键; 3 = 鼠标右键
          ipcRenderer.send('show-context-menu');
      }
    })

    $(document).on('click','.app-msg-image',function(){
      var imgUrls = $(this).attr('src');
      var imgUrlArr = imgUrls.split("#"); //字符分割
      var smallImgUrl = imgUrlArr[0]; //小图
      var bigImgUrl = imgUrlArr[1]; //大图
      var oriImgUrl = imgUrlArr[2]; //原图
      ipcRenderer.send('inmage-show',bigImgUrl);
    });
    
    $('body').on('click','#app-chat-meeting-check-users .app-meeting-personnel-item',function(){//视频会议邀请
      var status = $(this).attr('data-status');
      var id = $(this).attr('data-id');
      if(status == '1'){
          var html = $(this).html();
          $(this).attr('data-status','2');
          $(this).find('i').removeClass('layui-icon-circle').addClass('layui-icon-circle-dot').css('color','#08979d');
          $('#app-chat-meeting-checked-users').append('<li id="app-chat-checked-user-'+id+'" data-id="'+id+'" class="app-meeting-personnel-item">'+html.replace('layui-icon-circle','layui-icon-close-fill')+'</li>');
      }else{
          $(this).attr('data-status','1');
          $(this).find('i').removeClass('layui-icon-circle-dot').addClass('layui-icon-circle').css('color','#000');
          $('#app-chat-meeting-checked-users #app-chat-checked-user-' + id).remove();
      }
    });

    $('body').on('click','#app-chat-meeting-checked-users .app-chat-friend-icon',function(){
      var id = $(this).parents('.app-meeting-personnel-item').attr('data-id');
      $(this).parents('.app-meeting-personnel-item').remove();
      $('#app-seach-check-user-'+id).find('i').removeClass('layui-icon-circle-dot').addClass('layui-icon-circle').css('color','#000');
      $('#app-seach-check-user-'+id).attr('data-status','1');
    });

    $('body').on('click','#app-chat-meeting-confirm',function(){
      let member_list = [];
      $('#app-chat-meeting-checked-users').find('.app-meeting-personnel-item').each(function(){
          member_list.push($(this).attr('data-id'));
      });
      ipcRenderer.send('GroupMeeting',webim.ctx,member_list);
    })

}

chat.event();

chat.sendMsg = ()=>{//聊天消息发送
      var msg = $('#send_msg_text').html();
      $('#send_msg_text .emoji_icon').each(function(i,item){
        let code = $(item).attr('data-code');

        let emoji_str = $(item).prop("outerHTML");
        let rep_str = escapeJquery(emoji_str);
        var reger=new RegExp(rep_str,"gm"); 

        msg = msg.replace(reger,code);
      });
      imgReg = /<img.*?(?:>|\/>)/gi;
      msg = msg.replace(imgReg,'');
       var files = [];
       $('#send_msg_text').find('img').not(".emoji_icon,.file_image").each(function(i){
          files.push(dataURLtoFile($(this).attr('src')));
       });
       if(msg){//文字消息
         onSendMsg(msg);
       }
      if(files.length > 0){//图片文件
        $.each(files,(i,item)=>{
            var filesize = item.size;
            if(checkPic(item,filesize,"2")){
              uploadPic(item,1);
            }
        });
        files = [];
      }
      
      if(formData.formData){//拖拽文件
        $.each(formData.formData,(i,item)=>{
            var filesize = item[0].size;
            if(checkPic(item[0],filesize,'1')){
                uploadPic(item[0],1);
            }else{
                uploadFile(item[0],1);
            }
          });
          formData.formData.splice(0,formData.formData.length);
      }
}

chat.Choicepersonnel = ()=>{

  let list = db.get('group.userList.' + selToID).value();

  let ul_html = '';

  $.each(list,(e,item)=>{

    if(item.userId == loginInfo.identifier){
      return true;
    }

    let  picUrl = fileDomain + item.picUrl;
    if(item.picUrl == null || item.picUrl == ''){
        picUrl = (item.sex == '女')?'../assets/images/6.png':'../assets/images/7.png';
    }

    ul_html += `<li class="app-meeting-personnel-item" data-status="1" data-id="`+item.userId+`" id="app-seach-check-user-`+item.userId+`">
      <img src="`+picUrl+`" />
      <span class="app-chat-friend-name">`+item.realName+`</span>
      <span class="app-chat-friend-icon">
        <i class="layui-icon layui-icon-circle"></i>
      </span>
    </li>`;

  });

  var html = `<div class="check-box layui-form layui-low">
    <div class="layui-col-xs6">
        <div class="app-chat-friend-title">人员列表</div>
        <ul id="app-chat-meeting-check-users" class="app-chat-friend-list">
            `+ul_html+`
        </ul>
    </div>
    <div class="layui-col-xs6">
        <div class="app-chat-friend-title">参会人员</div>
        <ul id="app-chat-meeting-checked-users" class="app-chat-friend-list">
        </ul>
    </div>
    <div class="app-chat-friend-console layui-col-xs12">
        <button id="app-chat-meeting-confirm" class="layui-btn layui-btn-sm" >确定</button>
        <button class="layui-btn layui-btn-primary layui-btn-sm app-chat-friend-cancel">取消</button>
    </div>
  </div>`;

  utility.index = layer.open({
    type: 1,
    title:'请勾选参会人员',
    area: ['460px', '440px'], //宽高
    content: html,
  });
}

ipcRenderer.on('paste-other',function(){//复制按钮
  let base64_image = clipboard.readImage().toDataURL();
  let copy_text = clipboard.readText();
  if(!clipboard.readImage().isEmpty()){
    $("#send_msg_text").append($('<img>').css({"width":130,"height":60}).attr('src',base64_image));
    $('#send-message').attr("disabled",false);
  }else{
    $("#send_msg_text").append(copy_text);
    $('#send-message').attr("disabled",false);
  }
});


function dataURLtoFile(dataurl, filename) {//base64转换file对象
  var arr = dataurl.split(',');
  var mime = arr[0].match(/:(.*?);/)[1];
  var bstr = atob(arr[1]);
  var n = bstr.length; 
  var u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  //转换成file对象
  return new File([u8arr], filename, {type:mime});
}

var woohecc = {//聊天框换行处理
  placeCaretAtEnd : function(el) {
          el.focus();
          if (typeof window.getSelection != "undefined"
              && typeof document.createRange != "undefined") {
              var range = document.createRange();
              range.selectNodeContents(el);
              range.collapse(false);
              var sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
          }else if (typeof document.body.createTextRange != "undefined") {
              var textRange = document.body.createTextRange();
              textRange.moveToElementText(el);
              textRange.collapse(false);
              textRange.select();
        }
    },
}