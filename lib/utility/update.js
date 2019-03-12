
const request = require('request');
const {ipcRenderer} = require('electron');
const {exec} = require('child_process');

function StreamDownload() {
  this.downloadCallback = null;
}

// 下载进度
StreamDownload.prototype.showProgress = function (received, total) {
  const percentage = (received * 100) / total;
  // 用回调显示到界面上
  this.downloadCallback('progress', percentage);
};

// 下载过程
StreamDownload.prototype.downloadFile = function (patchUrl, callback) {

  this.downloadCallback = callback; // 注册回调函数

  const downloadFile = './USER.exe'; // 下载文件名称，也可以从外部传进来

  let receivedBytes = 0;
  let totalBytes = 0;

  const req = request({
    method: 'GET',
    uri: patchUrl
  });

  const out = fs.createWriteStream(path.join(STORE_PATH, downloadFile));
  req.pipe(out);

  req.on('response', (data) => {
    // 更新总文件字节大小
    totalBytes = parseInt(data.headers['content-length'], 10);
  });

  req.on('data', (chunk) => {
    // 更新下载的文件块字节大小
    receivedBytes += chunk.length;
    this.showProgress(receivedBytes, totalBytes);
  });

  req.on('end', () => {
    this.downloadCallback('finished', out);
 })
}

function downloadFileCallback(arg, percentage)
{
    if (arg === "progress")
    {
        layui.use('element', function(){
          var element = layui.element; //Tab的切换功能，切换事件监听等，需要依赖element模块
        
          element.progress('download', Math.floor(percentage)+'%');
        });
    }
    else if (arg === "finished")
    {
      exec(percentage.path,function () {
          ipcRenderer.send('download-quit');
      });
    }
}

ipcRenderer.on('download-data',(event,res)=>{
  $('.app-download-update-string').empty();
  $('.app-download-update-string').append(`<p>版本：V `+res.version+`</p>`);
  $('.app-download-update-string').append(res.versionDesc);
  let path_url = path.join(STORE_PATH, './USER.exe');

  fs.exists(path_url,function (flag) {
    if(flag){
      fs.unlink(path_url,(err)=>{
        if(err){
          console.log(err);
        }else{
          StreamDownload.prototype.downloadFile(res.downUrl,downloadFileCallback);
        }
      })
    }else{
      StreamDownload.prototype.downloadFile(res.downUrl,downloadFileCallback);
    }
  })
  
});





