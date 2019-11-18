const sgMail = require('@sendgrid/mail');

// SendGrid template ids
const VERIFY_TEMPLATE = 'd-808570545ada48e08f2f24328613428f';
const PAYMENT_TEMPLATE = 'd-9fb09235f88b4a2ebfe4e845c5096bfb';
const PRO_TEMPLATE = 'd-705a6c4ad6ed457db87f9c6513fb58b6';

sgMail.setApiKey(process.env.SENDGRID_KEY);

exports.sendVerification = (token, user) => sgMail.send({
  to: user.email,
  from: 'zazmic-blog@zazmicdemo.com',
  templateId: VERIFY_TEMPLATE,
  dynamic_template_data: {
    name: user.firstName,
    link: `${process.env.HOME_URL}/verify?token=${token}`,
  },
});

exports.sendProNotification = (user) => sgMail.send({
  to: user.email,
  from: 'zazmic-blog@zazmicdemo.com',
  templateId: PRO_TEMPLATE,
  dynamic_template_data: {
    name: user.firstName,
  },
});

exports.sendPaymentNotification = (link, user) => sgMail.send({
  to: user.email,
  from: 'zazmic-blog@zazmicdemo.com',
  templateId: PAYMENT_TEMPLATE,
  dynamic_template_data: {
    name: user.firstName,
    link,
  },
});
