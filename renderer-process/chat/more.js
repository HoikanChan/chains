
more = {};

more.event = ()=>{

    $('.app-chat-more').click(function(event){//更多信息
        let status = $(this).attr('data-status');
        if(status == '1'){
            more.loadFriend();//好友
        }else{
            more.loadGroup();//群组
        }
        event.stopPropagation();
    });

    $('.app-chat-right-setting-close').click(function(){
        $('.app-chat-right-body').hide();
    });

    $('#app-chat-create-group').click(function(){
        $('.app-chat-right-c2c-body').hide();
        utility.createdGroup(selToID,function(){
            more.loadFriend();
        });
    });

    $('#app-chat-addgroupUser').click(function(){
        $('.app-chat-right-group-body').hide();
        utility.createdGroup(0,function(){
            more.loadGroup();
        });
    });

    $('.app-chat-right-body').click(function(event){
        event.stopPropagation();
    });

    $('#app-chat-clear-record').click(function(){
        layer.confirm('确定清除此会话聊天记录?',{
            btn: ['确定','取消'] //按钮
        }, function(){
            $('#app-chat-list').empty();
            $('#sessDiv_'+escapeJquery(selToID)).find('.app-chats-item-text').empty();
            layer.msg('清除成功');
        });
    });


    $('body').on('click','#app-chat-check-users .app-chat-friend-item',function(){//创建群组\邀请群员
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
  
      $('body').on('click','.app-chat-friend-cancel',function(){//关闭邀请窗
          layer.close(utility.index);
      });
  
      $('body').on('click','#app-chat-createdGroup',function(){//确认操作
        let status = $(this).attr('data-status');
  
        if(status == '1'){//添加
            more.addGroupUser();
        }else{//邀请
          layer.prompt(
            {title: '请输入群组名称', formType: 3}, 
            function(name, index){
              more.created(name,index);
          });
        }
      });

      $('#app-chat-groupName').on('click','.app-chat-groupName-box',function(){//群组名称点击
        let group_name = $(this).find('.app-chat-group-name').text();
        var $input = $('<input>').addClass('app-chat-right-group-edit-name').attr('data-name',group_name).val(group_name);
        $(this).html('');
        $(this).hide();
        $('.app-chat-groupName-input-box').show();
        $('.app-chat-groupName-input-box').append($input);
        $input.focus();
      });
  
      $('.app-chat-right-setting-console').on('blur','.app-chat-right-group-edit-name',function(event){//群组名称修改
        let old_group_name = $(this).attr('data-name');
        let group_name = $(this).val();
        $('.app-chat-groupName-box').append(`<span class="app-chat-group-name">`+group_name+`</span>
        <span><i class="icon iconfont icon-xiugai"></i></span>`);
        $('.app-chat-left-head').find('p').text(group_name);
        $('.app-chat-right-groupInfo-name').text(group_name);
        $(this).remove();
        $('.app-chat-groupName-box').show();
        $('.app-chat-groupName-input-box').hide();
        if(old_group_name == group_name){
          return false;
        }
        var options = {
          'GroupId': selToID,
          'Name': group_name,
        };
  
        more.editGroupInfo(options,function(res){
            $('.app-chat-right-group-info-item').find('.app-chat-right-group-name').text(group_name);
        });
  
      });


}

more.loadFriend = ()=>{//获取好友信息
    $('.app-chat-right-c2c-body').show();

    let info = db.get('chats.list').find({userId:parseInt(selToID)}).value();

    var  picUrl = fileDomain + info.picUrl;
    if(info.picUrl == null || info.picUrl == ''){
        picUrl = (info.sex == '女')?'../assets/images/6.png':'../assets/images/7.png';
    }
    $('.app-chat-right-setting-userInfo').find('img').attr('src',picUrl);
    $('.app-chat-right-setting-userInfo').find('.app-chat-right-setting-userInfo-name').text(info.realName);
    $('.app-chat-right-setting-userInfo').find('.app-chat-right-setting-userInfo-other').text(info.position+'('+info.userPhone+')');
}

more.loadGroup = ()=>{//获取群组信息
    $('.app-chat-right-group-body').show();

    getGroupInfo(selToID,function(res){
        let info = res.GroupInfo[0];
        
        if(user.im.identifier == info.Owner_Account){
            $('#app-chat-group-quit').attr('data-status','2');
            $('#app-chat-group-quit').text('解散该群');
        }else{
            $('#app-chat-group-quit').attr('data-status','1');
            $('#app-chat-group-quit').text('退出该群');
        }

        var FaceUrl = (info.FaceUrl)?fileDomain + info.FaceUrl:'../assets/images/group.jpg';
        $('.app-chat-right-groupInfo').find('img').attr('src',FaceUrl);
        $('.app-chat-right-groupInfo-name').html(info.Name);
        $('.app-chat-right-groupInfo-other').html('群人员：'+info.MemberNum);

        var list = db.get('group.userList.' + selToID).value();
        $('.app-chat-groupList-list').empty();

        $('.app-chat-group-name').text(info.Name);

        $.each(list,(i,item)=>{
            var picUrl = fileDomain + item.picUrl;
            if(item.picUrl == null || item.picUrl == ''){
                picUrl = (item.userSex == '女')?'../assets/images/6.png':'../assets/images/7.png';
            }
            var li = `
            <li class="app-chat-groupList-item layui-col-xs3">
            <img src="`+picUrl+`" />
            <p>`+item.realName+`</p>
            </li>
            `;
            $('.app-chat-groupList-list').append(li);
        });

    });

}

more.created = (name,index)=>{//群组创建
    var member_list = [];
    var images = [];
    $('#app-chat-checked-users').find('.app-chat-friend-item').each(function(){
        member_list.push($(this).attr('data-id'));
        images.push($(this).find('img').attr('src'));
    });

    if(member_list.length == 0){
        layer.msg('请选择添加群好友');
        return;
    }

    if (webim.Tool.trimStr(name).length > 8) {
        name  = name.substr(0,8) + '...';
    }
    canvas2d(images,function(imgurl){
        var cg_id = Math.floor(Math.random()*(5000-1000+1)+1000);
        var groupType = "Public";
        var options = {
            'GroupId': cg_id,
            'FaceUrl':imgurl.data.fileUrl,
            'Owner_Account': user.im.identifier,
            'Type': groupType,
            'Name': name,
            'Notification': '',
            'Introduction': '',
            'MemberList': member_list
        };
        webim.createGroup(
            options,
            function(resp) {
                layer.close(index);
                layer.close(utility.index);
                layer.msg('创建群成功');
            },
            function(err) {
                alert(err.ErrorInfo);
            }
        );
    });

}

more.addGroupUser = ()=>{//群组成员邀请

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
            layer.close(utility.index);
            layer.msg('好友邀请成功');
        },
        function (err) {
            console.log(err.ErrorInfo);
        }
    );
}

more.editGroupInfo = (options,callback)=>{//修改群组信息
    webim.modifyGroupBaseInfo(
        options,
        callback,
        function (err) {
          console.log(err);
        }
    );
}



more.event();