const {ipcRenderer:ipc} = require('electron');
var search = {};

search.status = 1;
search.orgId = 0;

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



search.load();