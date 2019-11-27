class Stripe {
  constructor(opts) {
    const chargesList = [{ amount: 50 * 100 }];
    this.customers = {
      create: jest.fn(() => ({ id: 'test' })),
      createSource: jest.fn(() => ({ id: 'test' })),
    };
    this.charges = {
      list: () => ({ data: chargesList }),
      create: ({ amount }) => chargesList.push({ amount }),
    };
  }
}
const stripe = jest.fn(() => new Stripe());

module.exports = stripe;
module.exports.Stripe = Stripe;
