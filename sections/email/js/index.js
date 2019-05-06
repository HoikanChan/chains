const { app, remote } = require('electron');
const electron = require('electron');
const { ipcRenderer } = electron;
const host = "http://company.zqyzk.com/api/v1/";
const emailWindow = remote.getCurrentWindow();

initPage = function () {
  Vue.component('contacter-list', {
    template: '#contacter-list',
    mounted: function () {
    }
  });

  new Vue({
    el: 'main',
    data: {
      a: 'hi vue',
      tabName: 'inbox',
      deptAndUsers: []
    },
    methods: {
      minimizeWin: function () {
        emailWindow.minimize();
      },
      closeWin() {
        emailWindow.close();
      },
      switchOver: function (tabName) {
        this.tabName = tabName
      }
    },
    mounted(){
      window.$http.get('user/contacts').then(res => {
        console.log(res);
        if(res.code === '000'){
          this.deptAndUsers = res.data.deptAndUsers
          console.log(this);
        }
      })
    }
  })
};

ipcRenderer.on('synchronous-data', (event, data) => {
  console.log(data);
  const api = () => {
    let axiosInstance = axios.create({
      baseURL: host,
      headers: {
        Authorization: data.token
      }
    });
    axiosInstance.interceptors.response.use(function (response) {
      return response.data;
    }, function (error) {
      return Promise.reject(error);
    });
    return axiosInstance
  }
  window.$http = api();
  initPage();

});

