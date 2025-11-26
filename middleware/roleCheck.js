module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    // If role is in allowed list → allow access
    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ msg: "Access denied" });
  };
};
