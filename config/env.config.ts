import {config} from 'dotenv'
import { cleanEnv,str,num } from 'envalid'
config()

export const env = cleanEnv(process.env,{
    BOT_TOKEN:str(),
    CHANNEL_ID:num(),
    CHANNEL_LINK:str()
})