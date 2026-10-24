import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { getMarketingStats } from '../controllers/journeyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/stats').get(protect, admin, getDashboardStats);
router.route('/marketing-stats').get(protect, admin, getMarketingStats);

export default router;
