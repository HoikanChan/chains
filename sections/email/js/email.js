const Imap = require('imap')
// inspect = require('util').inspect
const MailParser = require('mailparser').MailParser;
const nodeMailer = require('nodemailer');
const iconv = require('iconv-lite')

function emailHelper() {
  const user = {
    email: "15622532145_10@zcyzk.com",
    password: "123456"
  }
  function sendEmail({ to, title, content, attachments }) {
    console.log(to)
    console.log(title)
    console.log(content)
    console.log(attachments)
    return new Promise((resolve, reject) => {
      const transporter = nodeMailer.createTransport({
        service: 'qiye.aliyun',
        port: 465, // SMTP 端口
        secure: true,
        // secureConnection: true, // 使用 SSL
        auth: {
          user: user.email,
          pass: user.password
        }
      });
      const mailOptions = {
        to: to,
        from: user, // 这里的from和 上面的user 账号一样的
        subject: title, // 标题
        text: content, // 标题
        attachments: attachments
      };
      console.log(mailOptions)
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          reject(error)
        }
        transporter.close();
        resolve('success')
      });
    })
  }
  function getEmailList(_box = 'inbox', search, start) {
    let box = _box
    return new Promise((resolve, reject) => {
      // const type = user.email.match(mailReg)[1]
      const imap = new Imap({
        user: user.email,
        password: user.password,
        host: 'imap.mxhichina.com',
        port: 993,
        tls: true
      })
      function openInbox(cb) {
        imap.openBox(box, true, cb)
      }
      imap.once('error', function (err) {
        imap.end()
        if (err.code === 'ENOTFOUND' || err.source === 'timeout' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
          // 无网络或网络有问题
          resolve([])
        } else {
          reject(err)
        }
        return false
      })
      imap.once('ready', function () {
        openInbox(function (err, box) {
          if (err) throw err
          let searchContent = ['ALL']
          if (search) {
            searchContent = [['HEADER', 'SUBJECT', search]]
          }
          imap.search(searchContent, function (err, results) {
            if (err) throw err
            if (!results.length) {
              imap.end()
              resolve([])
              return
            }
            let result = { headers: [], attrs: [] }
            let f
            let HEADER = 'HEADER';
            if (start) {
              results = results.filter(item => (item >= start))
              f = imap.fetch(results, { bodies: [HEADER] })
            } else {
              f = imap.fetch(results, { bodies: [HEADER] })
            }
            f.on('message', function (msg) {
              let chunks = []
              let size = 0
              let buf
              msg.on('body', function (stream, info) {
                stream.on('data', function (chunk) {
                  chunks.push(chunk)
                  size += chunk.length
                  buf = Buffer.concat(chunks, size)
                })
              })
              msg.once('attributes', function (attrs) {
                const str = iconv.decode(buf, 'gb18030')
                result.headers.push(Imap.parseHeader(str))
                result.attrs.push(attrs)
              })
            })
            f.once('end', function () {
              imap.end()
              const emailList = result.headers.map((item, index) => {
                return {
                  uid: result.attrs[index]['uid'],
                  from: result.headers[index]['from'].map(ite => (ite.replace(/"/g, ''))),
                  to: result.headers[index]['to'],
                  date: result.attrs[index]['date'],
                  flags: result.attrs[index]['flags'],
                  subject: result.headers[index]['subject']
                }
              })
              resolve(emailList)
            })
          })
        })
      })
      imap.connect()
    })
  }
  function getEmailDetail(uid, type) {
    return new Promise((resolve, reject) => {
      // const type = user.email.match(mailReg)[1]
      const imap = new Imap({
        user: user.email,
        password: user.password,
        host: 'imap.mxhichina.com',
        port: 993,
        tls: true
      })
      function openInbox(cb) {
        imap.openBox(box, false, cb)
      }
      imap.once('error', function (err) {
        imap.end()
        if (err.code === 'ENOTFOUND' || err.source === 'timeout' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
          // 无网络或网络有问题
          resolve([])
        } else {
          reject(err)
        }
        return false
      })
      imap.on('ready', function () {
        imap.openBox(type, false, function (err, box) {
          if (err) imap.end();
          // let HEADER = 'HEADER.FIELDS (TO FROM SUBJECT)';
          // let HEADER = "HEADER"
          var f = imap.fetch([uid], { bodies: '' });
          let detail = {}, content = '', attachmentList = [], flags;
          f.on('message', function (msg, seqno) {
            var mailparser = new MailParser();
            msg.once('attributes', function (attrs) {
              flags = attrs.flags
            });
            msg.on('body', function (stream, info) {
              stream.pipe(mailparser);
              //将为解析的数据流pipe到mailparser
              mailparser.on("headers", function (headers) {
                // console.log(headers)
                let subject = headers.get('subject');
                let from = headers.get('from').text;
                let to = headers.get('to').text;
                let date = headers.get('date');
                detail = {
                  uid,
                  subject: subject,
                  from: from,
                  to: to,
                  date: date,
                  flags
                }
              });
              mailparser.on("data", function (data) {
                if (data.type === 'text') {
                  console.log("邮件内容: " + data.text);
                  content = data.html ? data.html : data.text;
                }
                if (data.type === 'attachment') {
                  console.log("附件名称:" + data.filename);
                  attachmentList.push({
                    url: 'attachment/' + data.filename,
                    name: data.filename
                  });
                  data.content.pipe(fs.createWriteStream('attachment/' + data.filename));
                  //保存附件到当前目录下
                  data.release();
                }
              });
              //data是对象
            });

            msg.once('end', function () {
            });
          });
          f.once('error', function (err) {
            console.log('Fetch error: ' + err);
          });
          f.once('end', function () {
            console.log('Done fetching all messages!');
            imap.closeBox(function (err) {
              imap.end();
            });
            setTimeout(() => {
              detail.content = content;
              detail.attachmentList = attachmentList;
              resolve(detail)
            }, 300)
          });
        });
      });
      imap.connect()
    })
  }
  function setEmail(uid, type, flags) {
    return new Promise((resolve, reject) => {
      var imap = new Imap({
        user: user.email,
        password: user.password,
        host: 'imap.mxhichina.com', // 接收邮件服务器
        port: 993, // 端口
        tls: true,
      });
      imap.connect();
      imap.on('ready', function () {
        imap.openBox(type, true, function (err, box) {
          if (err) imap.end();
          // let HEADER = 'HEADER.FIELDS (TO FROM SUBJECT)';
          // let HEADER = "HEADER"
          var f = imap.fetch([uid], { bodies: '' });
          let detail = {}, content = '', attachmentList = [];
          f.on('message', function (msg, seqno) {
            msg.once('end', function () {
              imap.addFlags(uid, flags, function (err) {
                if (err) {
                  console.error(err);
                  return
                }
                imap.closeBox(function (err) {
                  if (err) {
                    console.error(err);
                  };
                  imap.logout();
                });
              });
            });
          });

          f.once('error', function (err) {
            console.log('Fetch error: ' + err);
          });
          f.once('end', function () {
            console.log('Done fetching all messages!');
            imap.closeBox(function (err) {
              imap.end();
            });
            setTimeout(() => {
              detail.content = content;
              detail.attachmentList = attachmentList;
              resolve(detail)
            }, 300)
          });
        });
      });
      imap.on('error', function (err) {
        console.log(err);
        resolve([])
      });
      imap.on('end', function () {
        console.log('Connection ended');
      });
    })
  }
  function delEmailFlag(uid, type, flags) {
    console.log(uid, type, user)
    return new Promise((resolve, reject) => {
      var imap = new Imap({
        user: user.email,
        password: user.password,
        host: 'imap.mxhichina.com', // 接收邮件服务器
        port: 993, // 端口
        tls: true,
      });
      imap.connect();
      imap.on('ready', function () {
        imap.openBox(type, true, function (err, box) {
          if (err) imap.end();
          // let HEADER = 'HEADER.FIELDS (TO FROM SUBJECT)';
          // let HEADER = "HEADER"
          var f = imap.fetch([uid], { bodies: '' });
          let detail = {}, content = '', attachmentList = [];
          f.on('message', function (msg, seqno) {
            msg.once('end', function () {
              imap.delFlags(uid, flags, function (err) {
                if (err) {
                  console.error(err);
                  return
                }
                imap.closeBox(function (err) {
                  if (err) {
                    console.error(err);
                    return
                  };
                  imap.logout();
                });
              });
            });
          });

          f.once('error', function (err) {
            console.log('Fetch error: ' + err);
          });
          f.once('end', function () {
            console.log('Done fetching all messages!');
            imap.closeBox(function (err) {
              imap.end();
            });
            setTimeout(() => {
              detail.content = content;
              detail.attachmentList = attachmentList;
              resolve(detail)
            }, 300)
          });
        });
      });
      imap.on('error', function (err) {
        console.log(err);
        resolve([])
      });
      imap.on('end', function () {
        console.log('Connection ended');
      });
    })
  }
  function testAccount() {
    return new Promise((resolve, reject) => {
      // const type = user.email.match(mailReg)[1]
      const imap = new Imap({
        user: user.email,
        password: user.password,
        host: 'imap.mxhichina.com', // 接收邮件服务器
        port: 993,
        tls: true
      })
      function openInbox(cb) {
        imap.openBox('INBOX', false, cb)
      }
      imap.once('error', function (err) {
        imap.end()
        reject(err)
        return false
      })
      imap.once('ready', function () {
        openInbox(function (err, box) {
          if (err) {
            reject(err)
            return false
          }
          imap.search(['ALL'], () => {
            resolve()
          })
        })
      })
      imap.connect()
    })
  }

  return {
    getEmailList,
    getEmailDetail,
    setEmail,
    delEmailFlag,
    sendEmail,
    testAccount
  }
}
