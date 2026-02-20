

//Text-base AI chat Message Controller

import User from "../models/User";
import Chat from "../models/Chat";

export const textMessageController = async (req,res) => {
        try{
            const userId = req.user;
            const {chatId, prompt} = req.body

            const chat = await Chat.findOne({userId, _id: chatId})
            chat.messages.push({role:"user",content: prompt, timestamp: Date.now(),isImage: false})

            const {choices} = await openai.chat.completions.create({
                    model: "gemini-3-flash-preview",
                    messages: [
                        {
                            role: "user",
                            content:prompt,
                        },
                    ],
                });
            
                const reply = {...choices[0].messages,timestamp: Date.now(),isImage: false}
                res.json({success: true, reply})
                chat.messages.push(reply)
                await chat.save()
                await User.updateOne({_id: userId}, {$inc: {credits: -1}})

               

        }catch(error){
            res.json({success: false, message: error.message})
        }
}