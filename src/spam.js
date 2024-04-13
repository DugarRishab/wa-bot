import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

import fetch from 'node-fetch';
globalThis.fetch = fetch;

const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});


client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', (message) => processMessage(message));

let chat;
async function processMessage(message){
	chat = await message.getChat();
	chat.sendMessage('Nafis is the ultimate gay !!');
	for (let i = 0; i <= 100; i++) {
		chat.sendMessage('Nafis has no skills !!');
	}
	// for (let i = 0; i <= 10; i++) {
    //     chat.sendMessage('JS >>>>>>> py !!');
    // }
	
}

client.initialize();