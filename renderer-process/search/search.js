const {ipcRenderer:ipc} = require('electron');
var search = {};

search.status = 1;
search.orgId = 0;
search.index = '';

ipc.on('synchronous-webim',(event,webims)=>{
    webim.SetCTX(webims);
});

search.load = ()=>{

    $('#se_setmin_btn').click(function(){
        ipc.send('se_min');
    });
    $('#se_close_btn').click(function(){
        ipc.send('se_close');
    });

    $('.app-search-tab-title li').click(function(){
        var className = $(this).attr('class');
        var id = $(this).attr('data-id');
        $('.app-search-tab-title li').removeClass('app-search-this');
        if(!className){
            $(this).addClass('app-search-this');
        }
        if(id == '1'){
            search.status = 1;
            $('.app-search-addbox').show();
            $('#add-customer').hide();
            $('#customer-list').hide();
            $('#search-input').css('width','400px');
            $('.app-search-result-box').css('height','205px');
            $('#search-input').attr('placeholder','请输入群名');
        }else{
            search.status = 2;
            $('.app-search-addbox').hide();
            $('#add-customer').show();
            $('#customer-list').show();
            $('#search-input').css('width','290px');
            $('.app-search-result-box').css('height','341px');
            $('#search-input').attr('placeholder','请输入手机号/昵称');
            search.loadRelationOrgs();
        }
    })

    $('#search-btn').click(function(){
        if(search.status == 2){
            search.findCustomer();
        }
    });

    $('#add-customer').click(function(){
        utility.currencyGetAjax('cust/getDeptByRelationOrgId/'+search.orgId,undefined,function(res){
            if(res.code === '000'){
                var options = '';
                $.each(res.data,(i,item)=>{
                    if(item.deptName != '系统默认'){
                        options += `<option class="custDept-item" value="`+item.deptId+`">`+item.deptName+`<option>`;
                    }
                });
                search.addCustomer(options);
            }
        });
    })

    $('#customer-list').change(function(){
        search.orgId = $(this).val();
    })

    $('body').on('change','#inputuserName',function(){
		var userName = $(this).val().trim();

		utility.currencyGetAjax('cust/user/checkUserName',{userName:userName},(res)=>{
            console.log(res);
			if(res.code === '000'){
				layer.msg('用户名已存在', {icon: 10});
			}else{
			}
		})
    });
    
    $('#add-group').click(function(){
        search.loadFriends();
    });

    $('body').on('click','#app-seach-check-users .app-search-friend-item',function(){
        var status = $(this).attr('data-status');
        var id = $(this).attr('data-id');
        if(status == '1'){
            var html = $(this).html();
            $(this).attr('data-status','2');
            $(this).find('i').removeClass('layui-icon-circle').addClass('layui-icon-circle-dot').css('color','#08979d');
            $('#app-seach-checked-users').append('<li id="app-seach-checked-user-'+id+'" data-id="'+id+'" class="app-search-friend-item">'+html.replace('layui-icon-circle','layui-icon-close-fill')+'</li>');
        }else{
            $(this).attr('data-status','1');
            $(this).find('i').removeClass('layui-icon-circle-dot').addClass('layui-icon-circle').css('color','#000');
            $('#app-seach-checked-users #app-seach-checked-user-' + id).remove();
        }

    });

    $('body').on('click','#app-seach-checked-users .app-search-friend-icon',function(){
        var id = $(this).parents('.app-search-friend-item').attr('data-id');
        $(this).parents('.app-search-friend-item').remove();
        $('#app-seach-check-user-'+id).find('i').removeClass('layui-icon-circle-dot').addClass('layui-icon-circle').css('color','#000');
        $('#app-seach-check-user-'+id).attr('data-status','1');
    });

    $('body').on('click','.app-search-friend-cancel',function(){
        layer.close(search.index);
    });


    $('body').on('click','#app-search-createdGroup',function(){
        search.created();
    });

}

search.created = ()=>{
    var member_list = [];
    var name = '';
    $('#app-seach-checked-users').find('.app-search-friend-item').each(function(){
        member_list.push($(this).attr('data-id'));
        name += $(this).find('.app-search-friend-name').text() + ',';
    });

    if(member_list.length == 0){
        layer.msg('请选择添加群好友');
        return;
    }

    if (webim.Tool.trimStr(name).length > 8) {
        name  = name.substr(0,8) + '...';
    }

    var cg_id = Math.floor(Math.random()*(5000-1000+1)+1000);
    var groupType = "Private";
    var options = {
        'GroupId': cg_id,
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
            layer.close(search.index);
            layer.msg('创建群成功');
        },
        function(err) {
            alert(err.ErrorInfo);
        }
    );

}

search.loadRelationOrgs = ()=>{

    utility.currencyGetAjax('cust/relationOrgs',undefined,function(res){
        $('#customer-list').find('.customer-orgs').remove();
        var option = '';
        $.each(res.data.list,(i,item)=>{
            option += `<option class="customer-orgs" value=`+item.id+`>`+item.organName+`</option>`;
        })
        $('#customer-list').append(option);
    });

}

search.findCustomer = ()=>{
    var orgId = $('#customer-list').val();
    var searchStr = $('#search-input').val();

    $('.app-search-result-box').empty();
    utility.currencyGetAjax('cust/searchCust',{orgId:orgId,searchStr:searchStr,page:1,rows:10},function(res){

        if(res.code === '000'){

            if(res.data.list.length > 0 ){
                var $div = $('<div>'),$img = $('<img>'),$span = $('<span>'),$p = $('<p>');
                $.each(res.data.list,(i,item)=>{
                    var $div1 = $div.clone().addClass('app-search-result-item layui-col-xs4');
                    var $img1 = $img.clone().addClass('layui-circle').attr('src','');
                    var $span1 = $span.clone().text(item.real_name);
                    var $p1 = $p.clone().addClass('app-search-user-position').text(item.dept_name);
                    var $p2 = $p.clone().append(`<button data-userId="`+item.user_id+`" data-dept="`+item.dept_id+`">添加</button>`);
                });
            }

        }

    });

}
search.addCustomer = (options)=>{

    var html = `<form class="layui-form layui-container" action="">
            <div class="layui-form-item">
                <label class="layui-form-label">用户名*</label>
                <div class="layui-input-block">
                    <input type="text" id="inputuserName" name="userName" required  lay-verify="required" placeholder="请输入用户名" autocomplete="off" class="layui-input">
                </div>
            </div>
            <div class="layui-form-item">
                <label class="layui-form-label">密码*</label>
                <div class="layui-input-block">
                    <input type="password" name="userPwd" required lay-verify="required" placeholder="请输入密码" autocomplete="off" class="layui-input">
                </div>
            </div>
            <div class="layui-form-item">
                <label class="layui-form-label">姓名*</label>
                <div class="layui-input-block">
                    <input type="text" name="realName" required  lay-verify="required" placeholder="请输入姓名" autocomplete="off" class="layui-input">
                </div>
            </div>
            <div class="layui-form-item">
                <label class="layui-form-label">联系电话*</label>
                <div class="layui-input-block">
                    <input type="text" name="userPhone" required  lay-verify="required" placeholder="请输入联系电话" autocomplete="off" class="layui-input">
                </div>
            </div>
            <div class="layui-form-item">
                <label class="layui-form-label">QQ</label>
                <div class="layui-input-block">
                    <input type="text" name="userQq" required  lay-verify="required" placeholder="请输入QQ" autocomplete="off" class="layui-input">
                </div>
            </div>
            <div class="layui-form-item">
                <label class="layui-form-label">部门*</label>
                <div class="layui-input-block">
                    <select name="custDeptId" required>
                        <option class="custDept-item" value="">请选择部门</option>
                        `+options+`
                    </select>
                </div>
            </div>
            <div class="layui-form-item">
                <div class="layui-input-block">
                    <button class="layui-btn" lay-submit lay-filter="formDemo">立即提交</button>
                    <button type="reset" id="reset-btn" class="layui-btn layui-btn-primary">重置</button>
                </div>
            </div>
        </form>`;

    layer.open({
        type: 1,
        title:'添加客户/供应商',
        skin: 'layui-layer-rim', //加上边框
        area: ['460px', '440px'], //宽高
        content: html
    });

    layui.use('form', function(){
        var form = layui.form;
        
        form.render('select');

        form.on('submit(*)', function(data){

            utility.currencyAjax('post', 'user/saveRelationUser', JSON.stringify(data.field), function(res){
                if(res.code === '000'){
                    layer.msg('添加成功', {icon: 1});
                }else{
                    alert(res.message);
                }
            });

            return false;
        });

    });

}

search.loadFriends = ()=>{

    var friend = db.get('chats.list').value();
    var list = '';
    var $li = $('<li>'),$img = $('<img>'),$span = $('<span>');
    $.each(friend,(i,item)=>{
        if(item.userId != user.im.identifier){
            var $li1 = $li.clone().addClass('app-search-friend-item').attr({
                "data-status":'1',
                "data-id":item.userId,
                "id":"app-seach-check-user-"+item.userId,
            });
            var  picUrl = fileDomain + item.picUrl;
            if(item.picUrl == null || item.picUrl == ''){
                picUrl = (item.sex == '女')?'../../assets/images/6.png':'../../assets/images/7.png';
            }
            var $img1 = $img.clone().addClass('layui-circle').attr('src',picUrl);
            var $span1 = $span.clone().addClass('app-search-friend-name').text(item.realName);
            $li1.append($img1).append($span1).append('<span class="app-search-friend-icon"><i class="layui-icon layui-icon-circle"></i></span>');
            list += $li1.prop("outerHTML");
        }
    });

    var html = `<div class="check-box layui-form layui-low">
            <div class="layui-col-xs6">
                <div class="app-search-friend-title">好友列表</div>
                <ul id="app-seach-check-users" class="app-search-friend-list">
                    `+list+`
                </ul>
            </div>
            <div class="layui-col-xs6">
                <div class="app-search-friend-title">选择好友</div>
                <ul id="app-seach-checked-users" class="app-search-friend-list">
                </ul>
            </div>
            <div class="app-search-friend-console layui-col-xs12">
                <button id="app-search-createdGroup" class="layui-btn layui-btn-sm" >确定</button>
                <button class="layui-btn layui-btn-primary layui-btn-sm app-search-friend-cancel">取消</button>
            </div>
        </div>`;

    search.index = layer.open({
        type: 1,
        title:'请勾选需要添加的联系人',
        skin: 'layui-layer-rim', //加上边框
        area: ['460px', '440px'], //宽高
        content: html
    });

}

search.load();