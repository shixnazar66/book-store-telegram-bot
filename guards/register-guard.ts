import { InlineKeyboard, NextFunction,Context } from "grammy";
import { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import axios from "axios";


type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

export async function registerguard(ctx: MyContext, next: NextFunction) {
const userid = ctx.from?.id
await axios.get("http://localhost:3000/auth/telegram/"+userid)
.then(req => {
next()  
})
.catch(error => {
ctx.reply('avval registratsiyadan oting /registratsiya')
})
} 