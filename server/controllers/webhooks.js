import Stripe from 'stripe';
import Transcation from '../models/Transcation.js';
import User from '../models/User.js';
import { response } from 'express';

const fulfillOrder = async (transcationId) => {
    try {
        const transcation = await Transcation.findOne({ _id: transcationId, isPaid: false });
        if (transcation) {
            await User.updateOne({ _id: transcation.userId }, { $inc: { credits: transcation.credits } });
            transcation.isPaid = true;
            await transcation.save();
            console.log(`[Webhook] Fulfill success: Added ${transcation.credits} credits to user ${transcation.userId} for transaction ${transcationId}`);
            return true;
        }
        console.log(`[Webhook] Fulfill skipped: Transaction ${transcationId} not found or already paid`);
        return false;
    } catch (err) {
        console.error(`[Webhook] Fulfill error for transaction ${transcationId}:`, err.message);
        throw err;
    }
};

export const stripeWebhook = async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook error: ${err.message}`);
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    try {
        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const { transcationId, appId } = session.metadata || {};
                if (appId === "mjgpt" && transcationId) {
                    await fulfillOrder(transcationId);
                }
                break;
            }
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                try {
                    const sessionList = await stripe.checkout.sessions.list({
                        payment_intent: paymentIntent.id,
                        limit: 1
                    });
                    if (sessionList.data && sessionList.data.length > 0) {
                        const session = sessionList.data[0];
                        const { transcationId, appId } = session.metadata || {};
                        if (appId === "mjgpt" && transcationId) {
                            await fulfillOrder(transcationId);
                        }
                    }
                } catch (err) {
                    console.error(`[Webhook] Error retrieving session from payment intent: ${err.message}`);
                }
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
                break;
        }
        res.json({ received: true });
    } catch (error) {
        console.error(`Error processing webhook: ${error.message}`);
        res.status(500).send(`Error processing webhook: ${error.message}`);
    }
}