const MailListener = require('mail-listener2')

const currentTime = new Date().getTime()
const mailListener = new MailListener({
  username: 'hello@trustbucket.io',
  password: 'Plznohack123#',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  connTimeout: 10000,
  authTimeout: 5000,
  tlsOptions: { rejectUnauthorized: false },
  mailbox: 'INBOX',
  searchFilter: ['UNSEEN', ['SINCE', currentTime + 10000]],
  fetchUnreadOnStart: true,
  markSeen: true,
})

mailListener.start()

mailListener.on('server:connected', function () {
  console.log('[IMAP] Connected')
})

mailListener.on('server:disconnected', function () {
  console.log('[IMAP] Disconnected')
})

mailListener.on('error', function (err) {
  console.log(err)
})

mailListener.on('mail', function (mail) {
  console.log('[IMAP] MAIL')

//   if (!mail.bcc || !mail.to || !mail.from) return

  const date = mail.date
  const from = mail.from.address
//   const bcc = mail.bcc.address
  const to = mail.to.address

  console.log(mail)

//   if (!bcc) return

//   const id = bcc.replace('hello+','');

  const finalObject = {
    date,
    // id,
    from,
    to,
  }

//   console.log('EMAIL:', finalObject)
})
