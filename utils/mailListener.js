const MailListener = require('mail-listener2')
const schedule = require('node-schedule')
const { sendEmail } = require('./mailer')
const { defaultEmailTemplates } = require('../controllers/emailTemplate')
const AutomaticCollection = require('../models/automaticCollection')
const InvitationSettings = require('../models/invitationSettings')
const EmailTemplate = require('../models/emailTemplate')
const Company = require('../models/company')
const dayjs = require('dayjs')

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

mailListener.on('mail', async function (mail) {
  console.log('[IMAP] MAIL')

  if (!mail.bcc.length || !mail.to.length || !mail.from.length) return

  // const date = mail.date
  // const from = mail.from[0].address

  let slug
  mail.bcc.forEach((bcc) => {
    if (
      bcc.address.includes('hello+') &&
      bcc.address.includes('@trustbucket.io')
    ) {
      slug = bcc.address.replace('hello+', '').replace('@trustbucket.io', '')
    }
  })

  mail.to.forEach(async (to) => {
    const [firstName, lastName] = to.name.split(' ')
    const reciever = {
      firstName,
      lastName,
      email: to.address,
    }

    const ac = await AutomaticCollection.findOne({ slug })
    const company = await Company.findById(ac.company).populate('user')
    const invitation = await InvitationSettings.findOne({
      company: ac.company,
    })

    let template
    if (company.template) {
      template = await EmailTemplate.findById(company.template).select(
        'subject content linkUrl'
      )
    } else {
      template = defaultEmailTemplates(company.name, company.slug)[0]
    }

    schedule.scheduleJob(dayjs().add(ac.delay, 'minute'), async () => {
      await sendEmail(
        template,
        [reciever],
        ac._id,
        invitation,
        company.name,
        company.user.firstName
      )
    })
  })
})
