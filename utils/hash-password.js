const bcrypt = require('bcryptjs');

const hashPassword = async (user) => {
  try {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      /* eslint-disable-next-line no-param-reassign */
      user.password = await bcrypt.hash(user.password, salt);
    }
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.log(error);
  }
};

module.exports = hashPassword;
