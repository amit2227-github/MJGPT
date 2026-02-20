

//Text-base AI chat Message Controller
import axios from "axios"
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import imagekit from "../configs/imageKit.js";


export const textMessageController = async (req,res) => {
        try{
            const userId = req.user;

            if(req.user.credits < 2){
                return   res.json({success:false, message:"you don't have enough credits to use this feature"})
            }

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
        const generationImageUrl =  `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-
        ${encodedPrompt}/mjgpt/${Date.now()}.png?tr=w-800,h-800`;


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