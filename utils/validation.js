/* eslint-disable-next-line arrow-body-style */
const recordIsValid = (record) => {
  return record.title && record.content && record.author && record.publishedAt;
};

/* eslint-disable-next-line arrow-body-style */
const userIsValid = (user) => {
  return (
    user.firstName
    && user.lastName
    && user.email
    && /(.+)@(.+){2,}\.(.+){2,}/.test(user.email)
  );
};

module.exports = {
  recordIsValid,
  userIsValid,
};
