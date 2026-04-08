import Stripe from 'stripe';
import Transcation from '../models/Transcation.js';
import User from '../models/User.js';
import { response } from 'express';

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
                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object;
                    const sessionList = await stripe.checkout.sessions.list({
                        payment_intent: paymentIntent.id,
                        limit: 1
                    });
                    const session = sessionList.data[0];
                    const {transactionId, appId} = session.metadata;
                    if(appId === "mjgpt"){
                        const transcation = await Transcation.findOne({_id: transactionId, isPaid: false});
                        await User.updateOne({_id: transcation.userId} , {$inc: {credits: transcation.credits}});
                        transcation.isPaid = true;
                        await transcation.save();
                    }else{
                        return res.json({received: true,message:"Ignored event Invalid app"});
                    }

                    break;
                default:
                    console.log(`Unhandled event type ${event.type}`);
                    break;
            }
            res.json({ received: true });
    }catch (error) {
        console.error(`Error processing webhook: ${error.message}`);
        res.status(500).send(`Error processing webhook: ${error.message}`);
    }
}