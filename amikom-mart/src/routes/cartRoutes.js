const express = require('express');
const { getCart, addToCart, removeFromCart, checkoutCart } = require('../controllers/cartController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, getCart);
router.post('/', authenticateToken, addToCart);
router.delete('/:productId', authenticateToken, removeFromCart);
router.post('/checkout', authenticateToken, checkoutCart);

module.exports = router;