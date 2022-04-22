const mailjet = require('node-mailjet').connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
)
const campaignEmail = require('./emailTemplates/campaignEmail')
const confirmEmail = require('./emailTemplates/confirmEmail')
const forgotPassword = require('./emailTemplates/forgotPassword')
const reviewEmail = require('./emailTemplates/reviewEmail')

const From = {
  Email: 'kitanovicandrej213@gmail.com',
  Name: 'Trustbucket IO',
}

exports.getCampaignOverview = async () => {
  const { body: result } = await mailjet.get('campaignoverview').request()

  return result.Data
}

exports.sendEmail = async (
  template,
  recievers,
  campaignId,
  invitation,
  companyName,
  firstNameofUser
) => {
  try {
    const { subject, content, linkUrl } = template

    const { body: result } = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: recievers.map((reciever) => {
          let personalizedLinkUrl = linkUrl
          personalizedLinkUrl = personalizedLinkUrl.replace(
            /{campaignId}/g,
            campaignId
          )
          personalizedLinkUrl = personalizedLinkUrl.replace(
            /{firstName}/g,
            reciever.firstName
          )
          personalizedLinkUrl = personalizedLinkUrl.replace(
            /{lastName}/g,
            reciever.lastName
          )
          personalizedLinkUrl = personalizedLinkUrl.replace(
            /{email}/g,
            reciever.email
          )

          let personalizedContent = content
          personalizedContent = personalizedContent.replace(
            /{firstName}/g,
            reciever.firstName
          )
          personalizedContent = personalizedContent.replace(
            /{lastName}/g,
            reciever.lastName
          )
          personalizedContent = personalizedContent.replace(
            /{email}/g,
            reciever.email
          )
          personalizedContent = personalizedContent.replace(
            /{firstNameofUser}/g,
            firstNameofUser
          )
          personalizedContent = personalizedContent.replace(
            /{companyName}/g,
            companyName
          )

          let button = null
          if (/{review_link:(.*?)}/g.test(personalizedContent)) {
            const buttonText = personalizedContent
              .split('{review_link:')
              .pop()
              .split('}')[0]
            personalizedContent = personalizedContent.replace(
              /{review_link:(.*?)}/g,
              ''
            )

            button = {
              text: buttonText.trim(),
              url: personalizedLinkUrl,
            }
          }

          return {
            From: {
              Email: From.Email,
              Name: invitation.senderName,
            },
            To: [
              {
                Email: reciever.email,
                Name: `${reciever.firstName} ${reciever.lastName}`,
              },
            ],
            ReplyTo: {
              Email: invitation.replyTo,
            },
            Subject: subject,
            HTMLPart: campaignEmail({
              subject,
              content: personalizedContent,
              button,
            }),
            CustomCampaign: campaignId,
          }
        }),
      })

    console.log(result)
    return result.Data
  } catch (err) {
    console.log(err)
    return 'Error while sending!'
  }
}

exports.confirmEmail = async (user) => {
  try {
    const { body: result } = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From,
            To: [
              {
                Email: user.email,
                Name: `${user.firstName} ${user.lastName}`,
              },
            ],
            Subject: 'Trustbucket Confirmation Email',
            HTMLPart: confirmEmail(user),
          },
        ],
      })

    return result.Data
  } catch (err) {
    console.log(err)
    return 'Error while sending!'
  }
}

exports.forgotPassword = async (user) => {
  try {
    const { body: result } = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From,
            To: [
              {
                Email: user.email,
                Name: `${user.firstName} ${user.lastName}`,
              },
            ],
            Subject: 'Trustbucket Reset Password',
            HTMLPart: forgotPassword(user),
          },
        ],
      })

    return result.Data
  } catch (err) {
    console.log(err)
    return 'Error while sending!'
  }
}

exports.confirmReview = async (review) => {
  try {
    const { body: result } = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From,
            To: [
              {
                Email: review.email,
                // Name: `${user.firstName} ${user.lastName}`,
              },
            ],
            Subject: 'Trustbucket Confirmation Email',
            HTMLPart: reviewEmail(review),
          },
        ],
      })

    return result.Data
  } catch (err) {
    console.log(err)
    return 'Error while sending!'
  }
}
