
var formData = [];

// 阻止浏览器默认事件
$(document).on({
    dragleave: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },
    drop: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },
    dragenter: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },
    dragover: function(e) {
        e.stopPropagation();
        e.preventDefault();
    }
});

// 文件拖拽
var areas = document.getElementById('app-chat-section');

// 鼠标离开拖拽区域
areas.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
}, false);
// 拖拽结束
areas.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.style.border = '0';
    var files = e.dataTransfer.files; // 文件列表
    // 遍历列表并显示在页面上
    for(var i = 0; i < files.length; i++) {
        (function(e, list) {
            renderFile(list[e]);
        })(i, files)
    }
    formData.push(files);
}, false);

areas.addEventListener('keydown', function(e) {
    

});

areas.addEventListener("paste", function (e) {
    e.stopPropagation();
    e.preventDefault();
    var cbd = e.clipboardData;
    var ua = window.navigator.userAgent;

    // 如果是 Safari 直接 return
    if ( !(e.clipboardData && e.clipboardData.items) ) {
        return;
    }
    
    // Mac平台下Chrome49版本以下 复制Finder中的文件的Bug Hack掉
    if(cbd.items && cbd.items.length === 2 && cbd.items[0].kind === "string" && cbd.items[1].kind === "file" &&
        cbd.types && cbd.types.length === 2 && cbd.types[0] === "text/plain" && cbd.types[1] === "Files" &&
        ua.match(/Macintosh/i) && Number(ua.match(/Chrome\/(\d{2})/i)[1]) < 49){
        return;
    }
    
    for(var i = 0; i < cbd.items.length; i++) {
        var item = cbd.items[i];
        if(item.kind == "file"){
            var blob = item.getAsFile();
            if (blob.size === 0) {
                return;
            }
            // blob 就是从剪切板获得的文件 可以进行上传或其他操作
        }
    }
}, false);


/**
 * 
 * @param {Object} file
 */
function renderFile(file) {
    var fileName = file.name, // 文件名称
        suffixName = getFileSuffix(fileName), // 文件后缀
        showFileIcon = filterFile(suffixName); // 文件类型图标
    if(showFileIcon == 'other') {
        showFileIcon = filterImg(suffixName);
    }
    encapsulation(fileName, showFileIcon); // 处理图片及文字  展示
}

/**
 * 获取文件图标 
 * 常用的文件类型
 * 通过文件后缀的方式获取当前文件的图标
 * @param {Object} suffix 文件后缀
 * @param {Object} file 文件
 * @return {String} 字符串
 */
function filterFile(suffix) {
    var icon = "../assets/images/file_icon/";
    switch(suffix.toLowerCase()) {
        case 'doc':
        case 'docx':
            icon += 'doc.png';
            break;
        case 'txt':
            icon += 'txt.png';
            break;
        case 'psd':
            icon += 'psd.png';
            break;
        case 'rar':
            icon += 'rar.png';
            break;
        case 'zip':
            icon += 'zip.png';
            break;
        case 'xls':
        case 'xlsx':
            icon += 'xls.png';
            break;
        case 'ppt':
            icon += 'ppt.png';
            break;
        case 'pdf':
            icon += 'pdf.png';
            break;
        default:
            // 普通图片处理
            icon = 'other';
    }
    return icon;
}

/**
 * 图片文件筛选
 * 只有几种常用图片格式
 * @param {Object} suffix 文件后缀
 */
function filterImg(suffix) {
    var icon = '../assets/images/file_icon/';
    switch(suffix) {
        case 'bmp':
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            icon += 'pic.png'
            break;
        default:
        icon += 'other.png';
    }
    return icon;
}

/**
 * 获取文件后缀
 * 直接用分割字符串的方式获取
 * 因为文件类型名称太长不好找
 * @param {Object} fileName 文件名称
 * @return {String} 字符串
 */
function getFileSuffix(fileName) {
    var fileNames = fileName.split('.');
    var suffix = fileNames[fileNames.length - 1];
    return suffix;
}

/**
 * 包装文件
 * 用标签将文件及文件名称包装起来
 * 好用于页面展示
 * 由于编辑框属性原因会导致子元素也会编辑的问题
 * 用 canvas 将文件类型图片与文件名称合成为一张新的图片展示在编辑框中
 * 到时候会区分这里生成的文件展示图片和要发送的图片
 * 
 * @param {Object} fileName 文件名称
 * @param {Object} showFileIcon 文件显示的图标
 */
function encapsulation(fileName, showFileIcon) {
    var c = document.createElement('canvas');
    c.width = 60;
    c.height = 70;
    var ctx = c.getContext("2d");
    var img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0, 150, 150, 15, 15, 40, 40);
        ctx.save();
        ctx.font = "normal 12px arial,sans-serif";
        var texts = textHandle(fileName, ctx);
        ctx.textAlign = texts[1];
        var fleft = (texts[1] == 'center') ? (c.width / 2) : 0;
        ctx.fillText(texts[0], fleft, 65, 65);
        var imgs = "<img data-type='file-type-img' class='file_image' data-name='"+fileName+"' src='" + c.toDataURL('image/png') + "' />";
        show('#send_msg_text', imgs);
    }
    img.src = showFileIcon;
}

/**
 * 文件名称长度处理
 * 当文件名过程时 使用省略号
 * @param {Object} str
 * @param {Object} ctx
 * @return {Array}
 */
function textHandle(str, ctx) {
    var newText = '',
        w = 0,
        align = '';
    for(var i = 0; i < str.length; i++) {
        w += ctx.measureText(str[i]).width;
        if(w > 100) {
            newText = str.slice(0, (i - 1)) + '...';
            align = 'left';
            break;
        } else {
            newText = str.slice(0, i+1);
            align = 'center';
        }
    }
    return [newText, align];
}

/**
 * 显示
 * 显示在页面消息编辑框中
 * @param {Object} obj 
 * @param {Object} html 包装的图片
 */
function show(obj, html) {
    var oldValue = $(obj).html(),
        newValue = oldValue += html;
    $(obj).append(html);
}

/**
 * 将图片文件放入formData
 * @param {Object} files
 * @return {FormData}
 */
function getFormData(files) {
    var formData = new FormData();
    $.each(files, function(i, n) {
        formData.append('file', n);
    });
    return formData;
}

exports.formData = formData;
