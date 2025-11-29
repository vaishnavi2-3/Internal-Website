module.exports = function roleCheck(...allowedRoles) {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    if (!req.user.role) {
      return res.status(400).json({ msg: "User role missing" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: "You are not allowed to access this route" });
    }

    next();
  };
};
