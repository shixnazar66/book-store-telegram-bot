import { Bot, InlineKeyboard, Keyboard, Context } from "grammy";
import * as grammy from "grammy";
import {
   createConversation,
   type Conversation,
   type ConversationFlavor,
   conversations,
} from "@grammyjs/conversations";
import { env } from "./config/env.config";
import axios from "axios";
import { emit } from "process";
import { error } from "console";

const token = env.BOT_TOKEN;

// const bot = new Bot(token);






type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;


const bot = new Bot<MyContext>(token);


bot.use(grammy.session({ initial: () => ({}) }));
bot.use(conversations());


bot.use(createConversation(addQuestion,{id:'addquestion'}))
export async function addQuestion(
  conversation: MyConversation,
  ctx: MyContext
) {

  const userID = ctx.from?.id

  ctx.reply("ismingizni yozing");
  const name = await conversation.form.text();


  ctx.reply("familyangizni yozing");
  const lastname = await conversation.form.text();


  ctx.reply("parolingizni yozing");
  const password = await conversation.form.text();


  ctx.reply('emailingizni yozing')
  const email = await conversation.form.text()


  const jv = {
   firstname:name,
   password:password,
   email:email,
   lastname:lastname,
   telegramID:userID
  }


  const headers = {
   'Content-Type': 'application/json'
 };

  await axios.put("http://localhost:3000/auth/register",jv,{headers})
  .then(req => {
   ctx.reply('registratsiyadan otdingiz')
  })
  .catch(error => {
   console.log(error.data);
  })
}


bot.command("registratsiya", async (ctx) => {
   const userID = ctx.from?.id
   axios.get("http://localhost:3000/auth/telegram/"+userID)
  .then(req => {
   ctx.reply('siz allaqachon registratsiyadan otgansiz')
  })
  .catch(error => {
     ctx.conversation.enter('addquestion')
  })
  
})




bot.command("start", async (ctx) => {
     const userID = ctx.from?.id
     axios.get("http://localhost:3000/auth/telegram/"+userID)
    .then(req => {
     ctx.reply('bingo')
    })
    .catch(error => {
      ctx.reply('avval registratsiyadan oting')
    })
});





bot.on('message',async (ctx) => {
const text = ctx.message?.text
axios.put("http://localhost:3000/book/bookfind",{bookname:text})
.then(req => {
ctx.reply(`bookname ° ${req.data.bookname}
author ° ${req.data.author}
booklanguage ° ${req.data.booklanguage}
money ° ${req.data.money}`)
})
.catch(error => {
ctx.reply('bunday kitob majvud emas');
 })
})












bot.start();