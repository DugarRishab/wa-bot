import dotenv from 'dotenv';
dotenv.config({ path: './config.env' }); // <- connecting the enviroment variables

export default {
	host: '127.0.0.1',
	port: '6379'
}