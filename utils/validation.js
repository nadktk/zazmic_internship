/* eslint-disable arrow-body-style */
const recordIsValid = (record) => {
  return record.title && record.content && record.publishedAt;
};

const userIsValid = (user) => {
  return (
    user.firstName
    && user.lastName
    && user.email
    && /(.+)@(.+){2,}\.(.+){2,}/.test(user.email)
  );
};

const userUpdateIsValid = (user) => {
  return user.firstName && user.lastName;
};

module.exports = {
  recordIsValid,
  userIsValid,
  userUpdateIsValid,
};
