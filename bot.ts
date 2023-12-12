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
import { channelGuard } from "./guards/channel-guard";


const token = env.BOT_TOKEN;



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

  ctx.reply("ismingizni yozing ✒️");
  const name = await conversation.form.text();


  ctx.reply("familyangizni yozing 🖋️");
  const lastname = await conversation.form.text();


  ctx.reply("parolingizni yozing 🔏");
  const password = await conversation.form.text();

 
  ctx.reply('emailingizni yozing 🖊️')
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
   ctx.reply('registratsiyadan otdingiz tabriklayman ✅')
  })
  .catch(error => {
   if(error.response.status == 400){
    ctx.reply(`email yoki password xato ❌ 
  boshidan boshlang /registratsiya`)
   }
  })
}


bot.command("registratsiya", async (ctx) => {
   const userID = ctx.from?.id
   axios.get("http://localhost:3000/auth/telegram/"+userID)
  .then(req => {
   ctx.reply('siz allaqachon registratsiyadan otgansiz ✅')
  })
  .catch(error => {
     ctx.conversation.enter('addquestion')
  })
})




bot.command("start",channelGuard, async (ctx) => {
     const userID = ctx.from?.id
     axios.get("http://localhost:3000/auth/telegram/"+userID)
    .then(req => {
    ctx.reply(`welcome 👀
      ------------------------------------------------------------   
                     nima qilishni hohlaysiz?
      ------------------------------------------------------------
registratsiyadan otish uchun -> /registratsiya
kitoblarni topish uchun -> /find
categoryni topish uchun -> /category
       ------------------------------------------------------------
                                 omad ✅`)
    })
    .catch(error => {
      ctx.reply('avval registratsiyadan oting /registratsiya')
    })
});



bot.command('me',async (ctx) => {
  const id = ctx.from?.id
  axios.get("http://localhost:3000/auth/saved/"+id)
  .then(req => {
const book = req.data
const keyboard = new InlineKeyboard()
.text('sotib olish 💸',`buy ${book.id}`).row()
ctx.reply(`sizning saqlagan kitobingiz ✅
          ------------------------
bookname ° ${book.bookname}
author ° ${book.author}
booklanguage ° ${book.booklanguage}
money ° ${book.money} som`,
{reply_markup:keyboard})
  })
  .catch(error => { 
     ctx.reply('siz xali hechnarsa saqlamagansiz ❌')
  })
})




bot.use(createConversation(findbook))
export async function findbook(
  conversation: MyConversation,
  ctx: MyContext
) {
  ctx.reply("kitob nomini yozing ✒️");
  const kitob = await conversation.form.text();
 axios.put("http://localhost:3000/book/bookfind",{bookname:kitob})
.then(req => {
const keyboard = new InlineKeyboard()
.text('sotib olish 💸',`buy ${req.data.id}`).row()
ctx.reply(`bookname ° ${req.data.bookname}
author ° ${req.data.author}
booklanguage ° ${req.data.booklanguage}
money ° ${req.data.money} som

(yana qidirish uchun /find buyrugidan foydalaning)`,
{reply_markup:keyboard})
}) 
.catch(error => {
ctx.reply(`bunday kitob majvud emas ❌

(yana qidirish uchun /find buyrugidan foydalaning)`);
 })
}


bot.command('find',async (ctx) => {
  ctx.conversation.enter('findbook')
})
 



bot.on('callback_query:data',async (ctx,next) => {
  const arr = ctx.callbackQuery.data
  if(arr.split(" ")[0] == 'buy'){
  const str = arr.split(" ")[1]
  axios.get("http://localhost:3000/book/buy/"+str)
  .then(req =>{
  ctx.reply(`tabriklaymiz siz (${req.data.bookname}) kitobini sotib oldingiz ✅`)
  })     
  .catch(error => {
    console.log('error');
  }) 
  }else{
    next()
  }
})





bot.command('category',async (ctx) => {
  try {
   const request = await axios.get("http://localhost:3000/category/findcategory")
   const jv:{categoryname:string}[] = request.data
   const names: string[] = jv.map(obj => obj.categoryname);
   const keyboard = new InlineKeyboard()
   for (let str of names){
   keyboard.text(`${str}`).row()
  }
  ctx.reply(`categoryni tanlang 📌`, { reply_markup: keyboard });
  } catch (error) {
    throw error
  }
})

  

bot.on('callback_query:data',async (ctx) => {
const str = ctx.callbackQuery.data
await axios.post("http://localhost:3000/category/findcat",{categoryname:str})
.then(req => {
const jv = req.data
for (let obj of jv.book){
const keyboard = new InlineKeyboard()
.text('sotib olish 💸',`buy ${obj.id}`).row()
ctx.reply(`${str} (categoriyasidagi kitob)

bookname: ${obj.bookname}
author: ${obj.author}
booklanguage: ${obj.booklanguage}
money: ${obj.money} som`,{reply_markup:keyboard})
}
})
.catch(error => {
  console.log(error); 
  ctx.reply('bunday categorya topilmadi ❌')
 })
})




bot.command('help',async (ctx) => {
  ctx.reply(`  
                 nima qilishni hohlaysiz?
  ------------------------------------------------------------
registratsiyadan otish uchun -> /registratsiya
kitoblarni topish uchun -> /find
categoryni topish uchun -> /category
saqlangan kitoblarni korish -> /me
   ------------------------------------------------------------
                             omad ✅`)
})



bot.on('message', async (ctx) => {
  ctx.reply('bingo')
})









bot.start();