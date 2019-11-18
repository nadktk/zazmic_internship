const express = require('express');
const path = require('path');
const asyncHandler = require('express-async-handler');

const root = path.dirname(process.mainModule.filename);
const { isLoggedIn } = require(path.join(root, 'passport'));

const { createCharge, getChargesTotal } = require(path.join(
  root,
  'services',
  'stripe-service',
));

const { sendPaymentNotification, sendProNotification } = require(path.join(
  root,
  'services',
  'mail-service',
));

const PRICE = 100;

const router = express.Router();

/**
 * @route   GET api/v1/fees
 * @desc    Returns amount of dollars to be paid for the current user to become PRO
 */

router.get(
  '/',
  isLoggedIn,
  asyncHandler(async (req, res, next) => {
    const { user } = req;

    if (user.stripe_customer_id) {
      // get total amount of user's charges
      const total = await getChargesTotal(user.stripe_customer_id);
      const amount = PRICE - total > 0 ? PRICE - total : 0;

      // send response
      res.json({ data: { amount } });
    } else {
      res.json({ data: { amount: PRICE } });
    }
  }),
);

/**
 * @route   PUT api/v1/fees
 * @desc    Creates a new charge and sets PRO status if it is necessary
 */

router.put(
  '/',
  isLoggedIn,
  asyncHandler(async (req, res, next) => {
    const chargeAmount = Number(req.body.amount) * 100;
    const { user } = req;

    // create a new charge
    const charge = await createCharge(chargeAmount, user);

    // send email notification
    await sendPaymentNotification(charge.receipt_url, user);

    // get total amount of user's charges
    const total = await getChargesTotal(user.stripe_customer_id);

    if (!user.is_pro && total >= PRICE) {
      await user.update({ is_pro: true });

      // send email notification
      await sendProNotification(user);
    }

    const amount = PRICE - total > 0 ? PRICE - total : 0;

    // send response
    res.json({ data: { user, amount } });
  }),
);

module.exports = router;
