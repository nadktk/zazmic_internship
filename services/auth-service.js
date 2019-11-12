exports.logout = async (req, res, next) => {
  try {
    await req.logout();
    await req.session.destroy();
    res.clearCookie('sid');
    res.send();
  } catch (err) {
    next(err);
  }
};
