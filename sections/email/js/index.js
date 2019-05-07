const { app, remote } = require('electron');
const electron = require('electron');
const { ipcRenderer } = electron;
const host = "http://company.zqyzk.com/api/v1/";
const emailHost = "http://192.168.1.134:3000/api/v1/email/";
const emailWindow = remote.getCurrentWindow();

initPage = function () {
  const deptListComponet = Vue.component('dept-list', {
    template: '#dept-list',
    props: ['dataList'],
    mounted: function () {
      console.log(this);
      console.log(this.dataList);
    }
  });

  new Vue({
    el: 'main',
    components: {
      'dept-list': deptListComponet
    },
    data: {
      imgHost: 'http://company.zqyzk.com/',
      tabName: 'inbox',
      emailList: [],
      deptAndUsers: [],
      mailDetail: '',
      listLoading: false,
      detailLoading: false
    },
    methods: {
      minimizeWin: function () {
        emailWindow.minimize();
      },
      closeWin() {
        emailWindow.close();
      },
      formatImgUrl: function (value) {
        return value ? this.imgHost + value : '../../assets/images/6.png'
      },
      hasStar(flags) {
        return flags.some(i => i.includes('Flag'))
      },
      switchOver: function (tabName) {
        this.tabName = tabName
      },
      readMail(uid) {
        console.log(uid);
        this.detailLoading = true
        $email.get('emailDetail', {
          params: {
            uid,
            type: 'Inbox'
          }
        }).then(res => {
          this.mailDetail = res.result
          this.detailLoading = false
        })
      },
      starMail(uid, flags) {
        debugger
        if (flags.length && this.hasStar(flags)) {
          $email.put(`del/${uid}`, {
            type: "Inbox",
            flags: "Flagged"
          }).then(res => {
            this.getMailList()
          })
        }else{
          $email.put(uid.toString(), {
            type: "Inbox",
            flags: "Flagged"
          }).then(res => {
            this.getMailList()
          })
        }
      },
      getMailList() {
        this.listLoading = true
        $email.get('get', {
          params: {
            type: this.tabName
          }
        }).then(res => {
          console.log(res);
          this.listLoading = false
          this.emailList = res.result.emailList
          if (this.emailList.length) {
            const fromReg = /"(.*)"/
            console.log('1', this.emailList);
            this.emailList = this.emailList.map(mail => {
              return {
                uid: mail.uid,
                from: fromReg.test(mail.from[0]) ? fromReg.exec(mail.from[0])[1] : mail.from[0],
                date: mail.date,
                flags: mail.flags,
                subject: mail.subject[0] || '无主题'
              }
            })
            console.log('2', this.emailList);
          }
        })
      }
    },
    watch: {
      tabName: function (val) {
        if (val === 'write') {

        } else if (val === 'contacts') {

        } else {
          this.getMailList()
        }
      }
    },

    mounted() {
      window.$http.get('user/contacts').then(res => {
        console.log(res);
        if (res.code === '000') {
          this.deptAndUsers = res.data.deptAndUsers
        }
      })
      this.getMailList()
    }
  })
};

ipcRenderer.on('synchronous-data', (event, data) => {
  console.log(data);
  const api = _host => {
    let axiosInstance = axios.create({
      baseURL: _host,
      headers: {
        Authorization: data.token
      }
    });
    axiosInstance.interceptors.response.use(function (response) {
      console.log('res', response);
      return response.data;
    }, function (error) {
      console.error(error);
      return Promise.reject(error);
    });
    return axiosInstance
  }
  window.$http = api(host);
  window.$email = api(emailHost);
  initPage();

});

