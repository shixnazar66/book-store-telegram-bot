"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findbook = exports.addQuestion = void 0;
const grammy_1 = require("grammy");
const grammy = __importStar(require("grammy"));
const conversations_1 = require("@grammyjs/conversations");
const env_config_1 = require("./config/env.config");
const axios_1 = __importDefault(require("axios"));
const channel_guard_1 = require("./guards/channel-guard");
const register_guard_1 = require("./guards/register-guard");
const token = env_config_1.env.BOT_TOKEN;
const bot = new grammy_1.Bot(token);
bot.use(grammy.session({ initial: () => ({}) }));
bot.use((0, conversations_1.conversations)());
bot.use((0, conversations_1.createConversation)(addQuestion, { id: 'addquestion' }));
function addQuestion(conversation, ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const userID = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
        ctx.reply("ismingizni yozing ✒️");
        const name = yield conversation.form.text();
        ctx.reply("familyangizni yozing 🖋️");
        const lastname = yield conversation.form.text();
        ctx.reply("parolingizni yozing 🔏");
        const password = yield conversation.form.text();
        ctx.reply('emailingizni yozing 🖊️');
        const email = yield conversation.form.text();
        const jv = {
            firstname: name,
            password: password,
            email: email,
            lastname: lastname,
            telegramID: userID
        };
        const headers = {
            'Content-Type': 'application/json'
        };
        yield axios_1.default.put("http://localhost:3000/auth/register", jv, { headers })
            .then(req => {
            ctx.reply('registratsiyadan otdingiz tabriklayman ✅');
        })
            .catch(error => {
            if (error.response.status == 400) {
                ctx.reply(`email yoki password xato ❌ 
  boshidan boshlang /registratsiya`);
            }
        });
    });
}
exports.addQuestion = addQuestion;
bot.command("registratsiya", channel_guard_1.channelGuard, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userID = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
    axios_1.default.get("http://localhost:3000/auth/telegram/" + userID)
        .then(req => {
        ctx.reply('siz allaqachon registratsiyadan otgansiz ✅');
    })
        .catch(error => {
        ctx.conversation.enter('addquestion');
    });
}));
bot.command("start", channel_guard_1.channelGuard, register_guard_1.registerguard, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.reply(`welcome 👀
  ------------------------------------------------------------   
                 nima qilishni hohlaysiz?
  ------------------------------------------------------------
registratsiyadan otish uchun -> /registratsiya
kitoblarni topish uchun -> /find
categoryni topish uchun -> /category
   ------------------------------------------------------------
                             omad ✅`);
}));
bot.command('me', channel_guard_1.channelGuard, register_guard_1.registerguard, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const id = (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id;
    axios_1.default.get("http://localhost:3000/auth/saved/" + id)
        .then(req => {
        const book = req.data;
        for (let str of book) {
            const keyboard = new grammy_1.InlineKeyboard()
                .text('sotib olish 💸', `buy ${str.id}`).row();
            ctx.reply(`sizning saqlagan kitobingiz ✅
          ------------------------
bookname ° ${str.bookname}
author ° ${str.author}
booklanguage ° ${str.booklanguage}
money ° ${str.money} som`, { reply_markup: keyboard });
        }
    })
        .catch(error => {
        ctx.reply('siz xali hechnarsa saqlamagansiz ❌');
    });
}));
bot.use((0, conversations_1.createConversation)(findbook));
function findbook(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        ctx.reply("kitob nomini yozing ✒️");
        const kitob = yield conversation.form.text();
        axios_1.default.put("http://localhost:3000/book/bookfind", { bookname: kitob })
            .then(req => {
            const keyboard = new grammy_1.InlineKeyboard()
                .text('sotib olish 💸', `buy ${req.data.id}`).text('saqlash ✅', `save ${req.data.id}`).row();
            ctx.reply(`bookname ° ${req.data.bookname}
author ° ${req.data.author}
booklanguage ° ${req.data.booklanguage}
money ° ${req.data.money} som

(yana qidirish uchun /find buyrugidan foydalaning)`, { reply_markup: keyboard });
        })
            .catch(error => {
            ctx.reply(`bunday kitob majvud emas ❌

(yana qidirish uchun /find buyrugidan foydalaning)`);
        });
    });
}
exports.findbook = findbook;
bot.command('find', channel_guard_1.channelGuard, register_guard_1.registerguard, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.conversation.enter('findbook');
}));
bot.on('callback_query:data', (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const arr = ctx.callbackQuery.data;
    if (arr.split(" ")[0] == 'buy') {
        const str = arr.split(" ")[1];
        axios_1.default.get("http://localhost:3000/book/buy/" + str)
            .then(req => {
            ctx.reply(`tabriklaymiz siz (${req.data.bookname}) kitobini sotib oldingiz ✅`);
            ctx.replyWithDocument(new grammy_1.InputFile('pdf/text.pdf'));
        })
            .catch(error => {
            console.log('error');
        });
    }
    else if (arr.split(" ")[0] == 'save') {
        const bookid = arr.split(" ")[1];
        const telegramid = ctx.from.id;
        const finduser = yield axios_1.default.get("http://localhost:3000/auth/telegram/" + telegramid);
        if (!finduser) {
            ctx.reply('avval registratsiyadan oting /registratsiya');
        }
        const userid = finduser.data.id;
        const jv = {
            userid: Number(userid),
            bookid: Number(bookid)
        };
        axios_1.default.post("http://localhost:3000/saved", jv)
            .then(req => {
            if (req.data == 'bingo') {
                ctx.reply(`tabriklaymiz siz saqladingiz ✅`);
            }
            else {
                ctx.reply('siz bu kitobni allaqachon saqlagansiz!');
            }
        })
            .catch(error => {
            if (error.response.data.statusCode == 401) {
                ctx.reply('token yoq');
            }
        });
    }
    else {
        next();
    }
}));
bot.command('category', channel_guard_1.channelGuard, register_guard_1.registerguard, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = yield axios_1.default.get("http://localhost:3000/category/findcategory");
        const jv = request.data;
        const names = jv.map(obj => obj.categoryname);
        const keyboard = new grammy_1.InlineKeyboard();
        for (let str of names) {
            keyboard.text(`${str}`).row();
        }
        ctx.reply(`categoryni tanlang 📌`, { reply_markup: keyboard });
    }
    catch (error) {
        throw error;
    }
}));
bot.on('callback_query:data', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const str = ctx.callbackQuery.data;
        const req = yield axios_1.default.post("http://localhost:3000/category/findcat", { categoryname: str });
        const jv = req.data;
        if (jv.book.length <= 0) {
            ctx.reply(`(${jv.categoryname}) categorysida kitoblar mavjud emas ❌`);
        }
        else {
            for (let obj of jv.book) {
                const keyboard = new grammy_1.InlineKeyboard()
                    .text('sotib olish 💸', `buy ${obj.id}`).text('saqlash ✅', `save ${obj.id}`).row();
                ctx.reply(`${str} (categoriyasidagi kitob)
 
bookname: ${obj.bookname}
author: ${obj.author}
booklanguage: ${obj.booklanguage}
money: ${obj.money} som`, { reply_markup: keyboard });
            }
        }
    }
    catch (error) {
        console.log(error);
        ctx.reply('bunday categorya topilmadi ❌');
    }
}));
bot.command('help', channel_guard_1.channelGuard, register_guard_1.registerguard, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.reply(`  
                 nima qilishni hohlaysiz?
  ------------------------------------------------------------
registratsiyadan otish uchun -> /registratsiya
kitoblarni topish uchun -> /find
categoryni topish uchun -> /category
saqlangan kitoblarni korish -> /me
   ------------------------------------------------------------
                             omad ✅`);
}));
bot.command("send", channel_guard_1.channelGuard, register_guard_1.registerguard, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.replyWithDocument(new grammy_1.InputFile(`pdf/text.pdf`));
}));
bot.on('message', channel_guard_1.channelGuard, register_guard_1.registerguard, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.reply('bingo');
}));
bot.start();
