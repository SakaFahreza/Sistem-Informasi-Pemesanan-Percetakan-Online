function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak: Anda tidak memiliki izin untuk halaman/fitur ini"
      });
    }
    next();
  };
}

module.exports = { authorizeRole };
