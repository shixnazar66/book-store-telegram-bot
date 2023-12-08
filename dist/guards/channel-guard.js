"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.channelGuard = void 0;
const grammy_1 = require("grammy");
const env_config_1 = require("../config/env.config");
function channelGuard(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = ctx.from;
        if (user) {
            const chatMember = yield ctx.api.getChatMember(env_config_1.env.CHANNEL_ID, user.id);
            if (["kicked", "left"].includes(chatMember.status)) {
                ctx.reply("botdan foydalanish uchun kanallarimizga obuna bo'ling", { reply_markup: new grammy_1.InlineKeyboard().url("kanal", env_config_1.env.CHANNEL_LINK) });
            }
            else {
                next();
            }
        }
    });
}
exports.channelGuard = channelGuard;
