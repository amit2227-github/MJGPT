import express from 'express';
import {protect} from '../middlewares/auth.js'
import { imageMessagesController, textMessageController } from '../controllers/messageController.js';

const messageRouter = express.Router()

messageRouter.post('/text', protect, textMessageController)
messageRouter.post('/image', protect, imageMessagesController)

export default messageRouter