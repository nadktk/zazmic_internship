const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_KEY);

exports.sendVerification = (token, user) => sgMail.send({
  to: user.email,
  from: 'zazmic-blog@zazmicdemo.com',
  templateId: process.env.SENDGRID_VERIFY_TEMPLATE,
  dynamic_template_data: {
    name: user.firstName,
    link: `${process.env.HOME_URL}/verify?token=${token}`,
  },
});

exports.sendProNotification = (user) => sgMail.send({
  to: user.email,
  from: 'zazmic-blog@zazmicdemo.com',
  templateId: process.env.SENDGRID_PRO_TEMPLATE,
  dynamic_template_data: {
    name: user.firstName,
  },
});

exports.sendPaymentNotification = (link, user) => sgMail.send({
  to: user.email,
  from: 'zazmic-blog@zazmicdemo.com',
  templateId: process.env.SENDGRID_PAYMENT_TEMPLATE,
  dynamic_template_data: {
    name: user.firstName,
    link,
  },
});
