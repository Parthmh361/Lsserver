const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
async function sendMessage(req,res){
     const {content,chatId} = req.body;
     if(!content || !chatId){
         console.log("Invalid data passed into request");
         return res.sendStatus(400);
     }
     var newMessage = {
         sender: req.user._id,
         content: content,
         chat: chatId
     }
     try{
         var message = await Message.create(newMessage);
         message = await message.populate("sender", "username picture");
         message = await message.populate("chat");
         message = await User.populate(message, {
             path: "chat.users",
             select: "name picture email"
         });
         await Chat.findByIdAndUpdate(req.body.chatId, {latestMessage: message});
         res.json(message);
     }catch(error){
         res.status(400);
         throw new Error(error.message);
     }
}
async function allMessages(req, res){
    try{
        const messages = await Message.find({chat:req.params.chatId})
        .populate("sender", "username picture email")
        .populate("chat");
        res.json(messages);
    }catch(error){
        res.status(400);
        throw new Error(error.message);
    }
}

module.exports = {
    sendMessage,
    allMessages
}