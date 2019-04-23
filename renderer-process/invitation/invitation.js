var invitation = {};


invitation.init = (obj)=>{

    moduleId = 'invitation';
    const link = document.querySelector(`link#${moduleId}[rel="import"]`);
    const template = link.import.querySelector('.modal-template')
    let clone = document.importNode(template.content, true);
    layer.open({
        type: 1,
        title: false,
        skin: false, //加上边框
        area: ['340px', '420px'], //宽高
        closeBtn: 0, //不显示关闭按钮
        shadeClose: true, //开启遮罩关闭
        content: '<div class="invitation-modal"></div>'
    });
    document.querySelector('.invitation-modal').appendChild(clone)

    $('.invitation-modal .app-invitation-title').text('xxx的视频邀请');
    $('.invitation-modal .app-invitation-user-image').attr('src','../assets/images/head.jpg');

}

module.exports.invitation = invitation;
