import { InlineKeyboard, NextFunction,Context } from "grammy";
import { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import { env } from "../config/env.config";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

export async function channelGuard(ctx: MyContext, next: NextFunction) {
  const user = ctx.from;
  if (user) {
    const chatMember = await ctx.api.getChatMember(env.CHANNEL_ID, user.id);
    if (["kicked", "left"].includes(chatMember.status)) {
      ctx.reply("botdan foydalanish uchun kanallarimizga obuna bo'ling", { reply_markup: new InlineKeyboard().url("kanal", env.CHANNEL_LINK) });
    } else {
      next();
    }
  }
}