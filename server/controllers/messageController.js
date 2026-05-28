//Text-base AI chat Message Controller
import axios from "axios"
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import imagekit from "../configs/imageKit.js";
import openai from "../configs/openai.js";


export const textMessageController = async (req, res) => {
    try {
      const userId = req.user._id || req.user;
        if (req.user.credits < 1) {
            return res.json({
                success: false,
                message: "You don't have enough credits"
            });
        }

        const { chatId, prompt } = req.body;
        const chat = await Chat.findOne({ userId, _id: chatId });

        if (!chat) {
            return res.json({
                success: false,
                message: "Chat not found"
            });
        }

        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false
        });

        const response = await openai.chat.completions.create({
    model: "gemini-2.5-flash",   // ✅ Updated to active 2.5 flash model
    messages: [
        { role: "user", content: prompt }
    ]
});
        const reply = {
            role: "assistant",
            content: response.choices[0].message.content,
            timestamp: Date.now(),
            isImage: false
        };

        chat.messages.push(reply);

        await chat.save();

        await User.updateOne(
            { _id: userId },
            { $inc: { credits: -1 } }
        );

        res.json({ success: true, reply });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
//Image Generation Message Controller

export const imageMessagesController = async (req,res) =>{
    try {
        const userId = req.user._id;
        if(req.user.credits < 2){
            return res.json({success:false, message:"You don,t have enough credits to use this feature"})
        }
        const {prompt, chatId, isPublished} = req.body
        //find chat
        const chat=await Chat.findOne({userId, _id:chatId})

        //push user messsage
          chat.messages.push({role:"user",
            content: prompt, 
            timestamp: Date.now(),
            isImage: false});
        
        //Encode The prompt
        const encodedPrompt = encodeURIComponent(prompt)

        //construct ImageKit AI generation URL
        const generationImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/mjgpt/${Date.now()}.png?tr=w-800,h-800`;


        //Trigger generation by fetching from ImageKit
        const aiImageResponse = await axios.get(generationImageUrl, {responseType: "arraybuffer"})

        //convert to Base64
        const base64Image =  `data:image/png;base64,${Buffer.from(aiImageResponse.data,"binary").toString('base64')}`;

        //Upload to imagekit media library 
        const uploadRespomse = await imagekit.upload({
            file:base64Image,
            fileName:`${Date.now()}.png`,
            folder:"mjgpt"
        })

            const reply = {role:'assistant',content:uploadRespomse.url,timestamp: Date.now(),isImage: true, isPublished}
                res.json({success: true, reply})

                chat.messages.push(reply)
                await chat.save()

                
                await User.updateOne({_id: userId}, {$inc: {credits: -2}})
                
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}