const stripe = require('stripe')(process.env.STRIPE_SK);

/**
 * Create stripe customer based on user's email
 */

exports.createCustomer = async (email) => {
  const customer = await stripe.customers.create({ email });
  return customer.id;
};

/**
 * Get stripe customer's charges total amount
 */

exports.getChargesTotal = async (customer) => {
  const charges = await stripe.charges.list({
    customer,
  });
  return charges.data.reduce((sum, ch) => sum + ch.amount, 0) / 100;
};

/**
 * Create charge
 */

exports.createCharge = async (amount, user) => {
  const charge = await stripe.charges.create({
    customer: user.stripe_customer_id,
    amount,
    currency: 'usd',
    description: `Charge PRO for ${process.env.HOME_URL}`,
    source: user.stripe_card_id,
  });
  return charge;
};

/**
 * Create stripe customer's card
 */

exports.createCard = async (token, customerId) => {
  const source = await stripe.customers.createSource(customerId, {
    source: token,
  });
  return source.id;
};
