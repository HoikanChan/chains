const {ipcRenderer}  = require('electron');   

ipcRenderer.on('show-src',(event,image)=>{
    $('body').append(`<image src="`+image+`"/>`);
});

