var hailfellow = {};

hailfellow.event = ()=>{
    //显示
    $('.app-hailfellow-list-item').click(function(){
        $('.app-hailfellow-child-list').removeClass('fadeOutDownBig is-hidden');
        $('.app-hailfellow-child-list').addClass('animated fadeInUp');
        
        let status = $(this).attr('data-status');
        let str = '';
        switch(status){
            case '1':
                str = '群聊';
                hailfellow.loadGroup();
                break;
            case '2':
                str = '客户';
                hailfellow.loadCust();
                break;
            case '3':
                str = '供应商';
                hailfellow.loadCust(2);
                break;
            case '4':
                str = '同事';
                hailfellow.load();
        }

        $('.app-hailfellow-child-name').text(str);
    });

    //隐藏
    $('#app-hailfellow-close').click(function(){
        $('.app-hailfellow-child-list').removeClass('fadeInUp');
        $('.app-hailfellow-child-list').addClass('fadeOutDownBig');
        setTimeout(function(){
            $('.app-hailfellow-child-list').addClass('is-hidden');
        },100);
        $('.app-hailfellow-child-customer-list').addClass('is-hidden');
        $('.app-hailfellow-child-user-list').addClass('is-hidden');
        $('.app-hailfellow-child-group-list').addClass('is-hidden');
    });

    $('.app-hailfellow-child-user-list').on('click','.app-hailfellow-child-department',function(){
        $(this).next('.app-hailfellow-user-list').slideToggle();
    });

    $('.app-hailfellow-child-customer-list').on('click','.app-hailfellow-child-customer-name',function(){
        $(this).next('.app-hailfellow-child-customer-childlist').slideToggle();
    });

    $('.app-hailfellow-child-customer-list').on('click','.app-hailfellow-child-department',function(){
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
		let picUrl = '../assets/images/group.png';

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

}

hailfellow.loadGroup = ()=>{
    $('.app-hailfellow-child-group-list').removeClass('is-hidden');
    $('.app-hailfellow-child-group-list').empty();
    getMyGroup(function(res){
        var $li = $('<li>'),$img = $('<img>'),$span = $('<span>');

        $.each(res.GroupIdList,(i,item)=>{
            if(item.Type == 'ChatRoom'){
                return true;
            }
            var $li1 = $li.clone().addClass('app-hailfellow-user-item').attr({
                'data-id':item.GroupId,
                'data-name':item.Name
            });
            var $img1 = $img.clone().addClass('layui-circle').attr('src','../assets/images/group.png');
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
            $('.app-hailfellow-friend-head').find('img').attr('src',picUrl);
            $.each(data,(i,item)=>{
                if(item == null){
                    data[i] = '<span class="color1">未设置</span>';
                }
            })
            $('.app-hailfellow-friend-head').find('p').html(data.realName);
            $('#app-hailfellow-position-text').html(data.position);
            $('#app-hailfellow-department-text').html(grouping);
            $('#app-hailfellow-introduce-text').html(data.introduce);
            $('#app-hailfellow-grouping-text').html(grouping);
            $('#app-hailfellow-nikename-text').html(data.realName);
            $('#app-hailfellow-phone-text').html(data.phone);
            $('#app-hailfellow-email-text').html(data.email);

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
                var $li1 = $li.clone().addClass('app-hailfellow-child-department').append(item.deptName + '<span><i class="icon iconfont icon-xiangxiazhanhang"></i></span>');
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
	$('.app-hailfellow-child-customer-list').removeClass('is-hidden');
    $('.app-hailfellow-child-customer-list').empty();
	utility.currencyGetAjax('user/custs/'+type,undefined,function(res){

		if(res.code === "000"){
            var data = res.data;
			var $ul = $('<ul>'),$li = $('<li>'),$span = $('<span>'),$img = $('<img>'),$span = $('<span>');
            $.each(data,(i,item)=>{
                var orgName = (item.orgName.length>10)?utility.subString(item.orgName,8) + '…' :item.orgName;
                var $li1 = $li.clone().addClass('app-hailfellow-child-customer-name').attr('title',item.orgName).append(orgName + '<span><i class="icon iconfont icon-fangkuai"></i></span>');
                var $ul1 = $ul.clone().addClass('app-hailfellow-child-customer-childlist').css('display','none');
                $.each(item.deptBos,(k,bos)=>{
                    var $li2 = $li.clone().addClass('app-hailfellow-child-department').append(bos.deptName + '<span><i class="icon iconfont icon-xiangxiazhanhang"></i></span>');
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



hailfellow.event();