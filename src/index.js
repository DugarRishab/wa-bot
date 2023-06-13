// const qrcode = require("qrcode-terminal");
// const { Client } = require("whatsapp-web.js");
// const dotenv = require('dotenv');
// const { ChatGPTUnofficialProxyAPI } = require('chatgpt');
import qrcode from 'qrcode-terminal';
import { Client } from 'whatsapp-web.js';
import dotenv from 'dotenv';
import { ChatGPTUnofficialProxyAPI } from 'chatgpt';
import Queue from 'bee-queue';
import redis from 'redis';
import fetch from 'node-fetch';
globalThis.fetch = fetch;

dotenv.config({ path: './config.env' }); // <- connecting the enviroment variables
// dotenv.config();

console.log(process.env.REDIS_HOST);


let queue;
const startRedis = async () => {

    const redisClient = redis.createClient({
        legacyMode: true,
        url: process.env.REDIS_URL,
    });

    redisClient.on('error', (error) => console.error(`Error : ${error}`));
    await redisClient.connect();


    queue = new Queue('messages', {
        removeOnSuccess: true,
        redis: {
            legacyMode: true,
            url: process.env.REDIS_URL,
        },
    });

    queue.process(async (job, done) => {
        try {
            // await job.data.reply('this is a test! no fuck off');
            const prompt = getPrompt(job.data.message);
            console.log(prompt);
            const res = await getGPTresponse(prompt);

            return res;
        } catch (err) {
            console.log('ERROR in processing JOB: ', err);
        }
    });
}
startRedis();

const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', (message) => processMessage(message));

const processMessage = async (message) => {
    try {
        const mentionedIds = message.mentionedIds.map((id) => id.split('@')[0]);
        const botMentioned = mentionedIds.includes(client.info.wid.user);
        const chat = await message.getChat();

        if (botMentioned || !chat.isGroup) {
            const job = await queue
                .createJob({ message: message, reply: message.reply })
                .save();

            job.on('failed', async () => {
                await job.retries(1).save();
            });
            job.on('succeeded', async (result) => {
                // console.log('> ', result);
                await job.data.message.reply(result);
            });
        }
    } catch (err) {
        console.log('ERROR in processing message: ', err);
    }
};



const getPrompt = (message) => {
    const prompt = message.body.replace('@917003653149', ' ');
    // replyToMsg(res);
    return prompt;
};

const getGPTresponse = async (prompt) => {
    try {
        const api = new ChatGPTUnofficialProxyAPI({
            accessToken: process.env.OPENAI_ACCESS_TOKEN,
            apiReverseProxyUrl: 'https://ai.fakeopen.com/api/conversation',
        });

        const res = await api.sendMessage(prompt);
        return res.text;
    } catch (err) {
        console.error('ERROR in gpt Response ', err);
    }
};

client.initialize();
