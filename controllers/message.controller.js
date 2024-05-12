import conversationModel from "../models/conversation.model";
import messageModel from "../models/message.model";
import Message from "../models/message.model";
import userModel from "../models/user.model";

export const sendMessage = async (req, res) => {
  try {
    console.log(req.user)
    const { message } = req.body;
    const recieverId = req.params.recId;
    const senderId = req.user._id
    const conversation = await conversationModel.findOne({
      participants: { $all: [senderId, recieverId] },
    });

    if (!conversation) {
      conversation = await conversationModel.create({
        participants: [senderId, recieverId],
      });
    }

    const newMessage = new Message({
      senderId,
      recieverId,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    await Promise.all([conversation.save(), newMessage.save()]);
    if (newMessage) {
      const responseData = {
        newMessage,
        
      };

      return res.status(201).json(responseData);
    }

    return res.status(400).json({
      message: "Something went wrong",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const senderId = req.user._id;

		const conversation = await conversationModel.findOne({
			participants: { $all: [senderId,chatId] },
		}).populate("messages");
    if (conversation) {
      return res.status(200).json(conversation.messages);
    }
    return res.status(400).json({
      message: "Something went wrong!!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
