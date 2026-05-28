import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js'
import userRouter from './routes/userRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import creditRouter from './routes/creditRoutes.js'
import { stripeWebhook } from './controllers/webhooks.js'

import User from './models/User.js'

const app= express()

await connectDB()

// Migration: Convert any string credits to number in existing documents to prevent $inc error
try {
  const usersWithStringCredits = await User.find({ credits: { $type: "string" } });
  if (usersWithStringCredits.length > 0) {
    console.log(`[Migration] Converting ${usersWithStringCredits.length} users with string credits to numeric credits...`);
    for (const user of usersWithStringCredits) {
      const parsed = Number(user.credits);
      await User.updateOne({ _id: user._id }, { $set: { credits: isNaN(parsed) ? 20 : parsed } });
    }
    console.log("✅ [Migration] Database credits migration completed successfully.");
  }
} catch (migrationError) {
  console.error("❌ [Migration] Error during credits migration:", migrationError.message);
}

//strip webhook route
app.post('/api/stripe',express.raw({type: 'application/json'}),stripeWebhook);

//Middleware
app.use(cors())
app.use(express.json())

//Rotues
app.get('/', (req,res)=>res.send('Server is working')) 
app.use('/api/user',userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/credit', creditRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () =>{
    console.log("well done bro")
})