import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkout, portal, webhook } from '../controllers/stripeController.js';
import express from 'express';

const router = Router();

// Webhook must receive the raw body — registered before authenticate
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

// All other Stripe routes require auth
router.use(authenticate);
router.post('/checkout', checkout);
router.post('/portal', portal);

export default router;
