var utility = {};

utility.host = "http://company.zqyzk.com/api/v1/";
utility.index = 0;


utility.ajax = (method, url, data, suc, err) => {

    $.ajax({
        type: method,
        crossDomain: true,
        url: utility.host + url,
        data: data,
        dataType: "json",
        success: suc,
        error: err
    });

};

utility.currencyAjax = (method, url, data, suc, err)=>{

    $.ajax({
        type: method,
        url: utility.host + url,
        data: data,
        headers:{
            "Content-Type":"application/json",
            "Authorization":Token
        },
        dataType: "json",
        success: suc,
        error: err
    });

}

utility.currencyFileAjax = (url, data, suc, err)=>{

    $.ajax({
        type: 'post',
        url: utility.host + url,
        data: data,
        async:false,
        contentType : false,
        processData : false,
        headers:{
            "Authorization":Token
        },
        dataType: "json",
        success: suc,
        error: err
    });

}

utility.currencyGetAjax = (url, data, suc, err)=>{

    $.ajax({
        type: 'get',
        url: utility.host + url,
        data: data,
        headers:{
            "Content-Type":"application/json",
            "Authorization": Token
        },
        dataType: "json",
        success: suc,
        error: err
    });

}

utility.subString = (string,num)=>{
    return string.substring(0,num);
}

utility.createdGroup = (user_id,callback)=>{

    var friend = db.get('chats.list').value();
    var list = '';
    var other_list = '';
    var status = '1';
    if(user_id){
        status = '2';
    }
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
            if(user_id == item.userId){
                $li1.removeClass('app-chat-friend-item').addClass('app-chat-friend-confirm-item');
                $li1.append($img1).append($span1).append('<span class="app-chat-friend-icon"><i class="layui-icon layui-icon-circle-dot" style="color: rgb(193,193,193);" ></i></span>');
                other_list = `<li data-id="`+user_id+`" class="app-chat-friend-item"><img src="`+picUrl+`" class="layui-circle"><span class="app-chat-friend-name">`+item.realName+`</span></li>`;
            }else{
                $li1.append($img1).append($span1).append('<span class="app-chat-friend-icon"><i class="layui-icon layui-icon-circle"></i></span>');
            }
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
        `+other_list+`
        </ul>
    </div>
    <div class="app-chat-friend-console layui-col-xs12">
        <button id="app-chat-createdGroup" data-status="`+status+`" class="layui-btn layui-btn-sm" >确定</button>
        <button class="layui-btn layui-btn-primary layui-btn-sm app-chat-friend-cancel">取消</button>
    </div>
  </div>`;

  utility.index = layer.open({
    type: 1,
    title:'请勾选需要添加的联系人',
    area: ['460px', '440px'], //宽高
    content: html,
    cancel:callback,
    end:callback
  });

}

//标签点击
utility.handleSectionTriggerShow = (event)=>{
    hideAllSectionsAndDeselectButtons();
    
    const sectionId = `${event.dataset.section}-section`;
    document.getElementById(sectionId).classList.add('is-shown');
}

function hideAllSectionsAndDeselectButtons(){

    const sections = document.querySelectorAll('.app-section.is-shown');
    Array.prototype.forEach.call(sections, (section) => {
      section.classList.remove('is-shown');
    })
}
