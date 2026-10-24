import express from 'express';
import { recordJourneyEvent } from '../controllers/journeyController.js';
const router = express.Router();
router.post('/event', recordJourneyEvent);
export default router;
