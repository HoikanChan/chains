var hailfellow = {};

hailfellow.event = ()=>{
    //显示
    $('.app-hailfellow-menu-list li').click(function(){
        $(this).parent().find('.active').removeClass('active');
        $(this).addClass('active');
        var id = $(this).attr('data-id');

        switch(id){
            case '1':
                $('.app-hailfellow-child-customer-box').addClass('is-hidden');
                $('.app-hailfellow-child-group-box').addClass('is-hidden');
                hailfellow.load();
                break;
                case '2':
                $('.app-hailfellow-child-group-box').addClass('is-hidden');
                $('.app-hailfellow-child-user-list').addClass('is-hidden');
                hailfellow.loadCust();
                break;
                case '3':
                $('.app-hailfellow-child-customer-box').addClass('is-hidden');
                $('.app-hailfellow-child-user-list').addClass('is-hidden');
                hailfellow.loadGroup();
                break;
            }
            
        $('.app-hailfellow-child-list').removeClass('is-hidden');
    });

    $('.app-hailfellow-child-customer-console').on('click','.app-hailfellow-child-customer-console-btn',function(){
        $(this).parent().find('.active').removeClass('active');
        $(this).addClass('active');
        let id = $(this).attr('data-id');
        hailfellow.loadCust(id);
    })

    $('.app-hailfellow-child-user-list').on('click','.app-hailfellow-child-department',function(){
        let icon_length = $(this).find('.transform-90').length;
        if(icon_length){
            $(this).find('i').removeClass('transform-90');
        }else{
            $(this).find('i').addClass('transform-90');
        }
        $(this).next('.app-hailfellow-user-list').slideToggle();
    });

    $('.app-hailfellow-child-customer-list').on('click','.app-hailfellow-child-customer-name',function(){
        let f_leng = $(this).find('.icon-fangkuai').length;
        if(f_leng){
            $(this).find('i').removeClass('icon-fangkuai').addClass('icon-fangkuai-');
        }else{
            $(this).find('i').removeClass('icon-fangkuai-').addClass('icon-fangkuai');
        }

        $(this).next('.app-hailfellow-child-customer-childlist').slideToggle();
    });

    $('.app-hailfellow-child-customer-list').on('click','.app-hailfellow-child-department',function(){
        let icon_length = $(this).find('.transform-90').length;
        if(icon_length){
            $(this).find('i').removeClass('transform-90');
        }else{
            $(this).find('i').addClass('transform-90');
        }
        $(this).next('.app-hailfellow-user-list').slideToggle();
    });

    $('.app-hailfellow-child-user-list,.app-hailfellow-child-customer-list').on('click','.app-hailfellow-user-item',function(event){
        utility.handleSectionTriggerShow(event.delegateTarget);
        var id = $(this).attr('data-id');
        var orgId = $(this).attr('data-org');
        var grouping = $(this).parent().attr('data-name');
        hailfellow.loadUserInfo(id,orgId,grouping);
    })

    $('.app-hailfellow-child-group-list').on('click','.app-hailfellow-user-item',function(event){
        hideAllSectionsAndDeselectButtons();

		let id = $(this).attr('data-id');
		let name = $(this).attr('data-name');
		let picUrl = $(this).attr('data-src');

		addSess(webim.SESSION_TYPE.GROUP,id,name,picUrl,'','HEAD');
		onSelSess(webim.SESSION_TYPE.GROUP,id,name);

       $('#chat-button').click();
       let sectionId = 'app-chat-section';
       document.getElementById(sectionId).classList.add('is-shown');
    })

    /**
	 * 发送消息（好友）
	 */
	$('#app-hailfellow-send-btn').click(function(){

        hideAllSectionsAndDeselectButtons();

		let id = $(this).attr('data-id');
		let name = $(this).attr('data-name');
		let picUrl = $(this).attr('data-pic');

		addSess(webim.SESSION_TYPE.C2C,id,name,picUrl,'','HEAD');
		onSelSess(webim.SESSION_TYPE.C2C,id,name);

       $('#chat-button').click();
       let sectionId = 'app-chat-section';
       document.getElementById(sectionId).classList.add('is-shown');
	});

    $('.app-hailfellow-child-addUser').click(function(){
        ipcRenderer.send('search-open',webim.ctx);
    });

    $('#app-hailfellow-email-btn').click(function(){
        utility.currencyGetAjax('email/loginToAlmailUrl',undefined,function(res){
            if(res.code == '000'){
                shell.openExternal(res.data);
            }
        });
    })

}

hailfellow.loadGroup = ()=>{
    $('.app-hailfellow-child-group-box').removeClass('is-hidden');
    $('.app-hailfellow-child-group-list .app-hailfellow-user-item').remove();
    getMyGroup(function(res){
        var $li = $('<li>'),$img = $('<img>'),$span = $('<span>');

        $.each(res.GroupIdList,(i,item)=>{
            if(item.Type == 'ChatRoom'){
                return true;
            }
            var FaceUrl = (item.FaceUrl)? fileDomain + item.FaceUrl:'../assets/images/group.jpg';
            var $li1 = $li.clone().addClass('app-hailfellow-user-item').attr({
                'data-id':item.GroupId,
                'data-name':item.Name,
                'data-src': FaceUrl
            });
            var $img1 = $img.clone().addClass('layui-circle').attr('src',FaceUrl);
            var $span1 = $span.clone().text(item.Name);

            $li1.append($img1).append($span1);
            $('.app-hailfellow-child-group-list').append($li1);
        })

    });

};

hailfellow.loadUserInfo = (id,orgId,grouping)=>{

    var organId = orgId?orgId:user.organs[0].organId;
    var str = "orgId="+organId+"&userId="+id;
    utility.currencyAjax('post','user/info2?'+str,undefined,function(res){
        if(res.code === '000'){
            var data = res.data;
            var  picUrl = fileDomain + data.picUrl;
            if(data.picUrl == null || data.picUrl == ''){
                picUrl = (data.sex == '女')?'../assets/images/6.png':'../assets/images/7.png';
            }
            $('.app-hailfellow-info-head').attr('src',picUrl);
            $.each(data,(i,item)=>{
                if(item == null){
                    data[i] = '<span class="color1">未设置</span>';
                }
            })
            let imOnlineState = (data.imOnlineState == 'Online')?`<span class="color2">在线<span>`:`<span class="color1">离线<span>`;
            $('.app-hailfellow-info-status').html(imOnlineState);
            $('.app-hailfellow-info-position').html(data.position);
            $('.app-hailfellow-info-department').html(grouping);
            $('.app-hailfellow-info-introduce').html(data.introduce);
            $('.app-hailfellow-info-sex').html(data.sex);
            $('.app-hailfellow-info-grouping').html(grouping);
            $('.app-hailfellow-info-name').html(data.realName);
            $('.app-hailfellow-info-phone').html(data.phone);
            $('.app-hailfellow-info-email').html(data.email);

            $('#app-hailfellow-section').attr({'data-id':id});
            $('#app-hailfellow-send-btn').attr({'data-id':id,'data-name':data.realName,'data-pic':picUrl});
        }else{
            console.log(res);
        }
    });

}

hailfellow.load = ()=>{
	
    $('.app-hailfellow-child-user-list').removeClass('is-hidden');
    $('.app-hailfellow-child-user-list').empty();
	utility.currencyGetAjax('user/contacts',undefined,function(res){
		if(res.code === "000"){
            var data = res.data.deptAndUsers;
            var $ul = $('<ul>'),$li = $('<li>'),$img = $('<img>'),$span = $('<span>');
            $.each(data,(i,item)=>{
                var $li1 = $li.clone().addClass('app-hailfellow-child-department').append('<span><i class="icon iconfont icon-xiaochengxuzititubiao-"></i></span>' + item.deptName);
                var $ul1 = $ul.clone().addClass('app-hailfellow-user-list').attr('data-name',item.deptName).css('display','none');
                $.each(item.users,(k,user)=>{
                    var $li2 = $li.clone().addClass('app-hailfellow-user-item').attr('data-id',user.userId);
                    var  picUrl = fileDomain + user.picUrl;
                    if(user.picUrl == null || user.picUrl == ''){
                        picUrl = (user.userSex == '女')?'../assets/images/6.png':'../assets/images/7.png';
                    }
                    var $img1 = $img.clone().addClass('layui-circle').attr('src',picUrl);
                    var $span1 = $span.clone().text(user.realName);

                    $ul1.append($li2.append($img1).append($span1));
                });
                $('.app-hailfellow-child-user-list').append($li1).append($ul1);
            });

		}else{
			console.log(res);
		}
	});

};


hailfellow.loadCust = (type = 1)=>{
	$('.app-hailfellow-child-customer-box').removeClass('is-hidden');
    $('.app-hailfellow-child-customer-list').find('.app-hailfellow-child-customer-name,.app-hailfellow-child-customer-childlist').remove('');
	utility.currencyGetAjax('user/custs/'+type,undefined,function(res){

		if(res.code === "000"){
            var data = res.data;
			var $ul = $('<ul>'),$li = $('<li>'),$span = $('<span>'),$img = $('<img>'),$span = $('<span>');
            $.each(data,(i,item)=>{
                var orgName = (item.orgName.length>10)?utility.subString(item.orgName,9) + '…' :item.orgName;
                var $li1 = $li.clone().addClass('app-hailfellow-child-customer-name').attr('title',item.orgName).append('<span><i class="icon iconfont icon-fangkuai"></i></span>' + orgName);
                var $ul1 = $ul.clone().addClass('app-hailfellow-child-customer-childlist').css('display','none');
                $.each(item.deptBos,(k,bos)=>{
                    var $li2 = $li.clone().addClass('app-hailfellow-child-department').append('<span><i class="icon iconfont icon-xiaochengxuzititubiao-"></i></span>' + bos.deptName);
                    var $ul2 = $ul.clone().addClass('app-hailfellow-user-list').attr('data-name',bos.deptName).css('display','none');
                    $.each(bos.userBos,(key,user)=>{
                        var $li3 = $li.clone().addClass('app-hailfellow-user-item').attr({'data-id':user.identifier,'data-org':item.id});;
                        var picUrl = user.picUrl ? fileDomain + user.picUrl: '../assets/images/head.jpg';
                        var $img1 = $img.clone().addClass('layui-circle').attr('src',picUrl);
                        var $span1 = $span.clone().text(user.realName);
                        
                        $ul2.append($li3.append($img1).append($span1));
                    })
                    $ul1.append($li2).append($ul2);
                });
                $('.app-hailfellow-child-customer-list').append($li1).append($ul1);
            });

		}else{
			console.log(res);
		}
	});

}

hailfellow.Menuload = ()=>{

    let menu_id =  $('.app-hailfellow-menu-list').find('.active').attr('data-id');

    switch (menu_id) {
        case '1':
            hailfellow.load();
            break;
        case '2':
            let cust_id =  $('.app-hailfellow-child-customer-console').find('active').attr('data-id');
            hailfellow.loadCust(cust_id);
            break;
        case '3':
            hailfellow.loadGroup();
            break;
    }

}

hailfellow.load();
hailfellow.event();

module.exports.hailfellow = hailfellow;