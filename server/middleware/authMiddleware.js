module.exports = (req, res, next) => {
    req.user = { id: "USER_ID_FROM_JWT" }; // replace with real JWT logic
    next();
  };
  