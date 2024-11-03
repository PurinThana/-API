const express = require('express');
const router = express.Router();
const { register, login, authorizeRole } = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes with role-based access control
router.get('/admin', authorizeRole(['admin']), (req, res) => {
    res.json({ message: "Admin content" });
});

router.get('/user', authorizeRole(['user', 'admin']), (req, res) => {
    res.json({ message: "User content" });
});

module.exports = router;
