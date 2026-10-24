import express from 'express';
import { getSubscribers, setSubscription, subscribe } from '../controllers/newsletterController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/', subscribe);
router.get('/', protect, admin, getSubscribers);
router.patch('/:id', protect, admin, setSubscription);

export default router;
