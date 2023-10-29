const TelegramApi = require("node-telegram-bot-api");
const { gameOptions, gameAgain } = require("./gameOptions");
const { token } = require("./token");

const bot = new TelegramApi(token, { polling: true });
const chats = {};
const info = {};
const startGame = async (chatId) => {
	const randNumber = Math.floor(Math.random() * 10).toString();

	chats[chatId] = randNumber;
	await bot.sendMessage(
		chatId,
		`Я загадаю цифру от 0 до 9, а ты отгадай! (${randNumber})`,
		gameOptions
	);
};

const start = () => {
	bot.setMyCommands([
		{ command: "/start", description: "Приветствие" },
		{ command: "/info", description: "Результаты" },
		{ command: "/game", description: "Угадайка" },
	]);

	bot.on("message", async (msg) => {
		const text = msg.text;
		const chatId = msg.chat.id;
		const nameUser = msg.from.first_name;

		if (text === "/start") {
			if (!info[chatId]) {
				info[chatId] = {
					success: 0,
					reject: 0,
				};
			}
			await bot.sendSticker(
				chatId,
				"CAACAgUAAxkBAAEBpNRlPQ2fIlkmX57wg4oJJN7Z0RWGUwACWQADygx6F-xYAb04svApMAQ"
			);
			return await bot.sendMessage(chatId, `Добро пожаловать в бот`);
		}
		if (text === "/info")
			if (info[chatId]) {
				return await bot.sendMessage(
					chatId,
					`${nameUser},вот твои попытки: Успех - ${info[chatId].success}; Провал - ${info[chatId].reject}`
				);
			}

		if (text === "/game") {
			return startGame(chatId);
		}
		return await bot.sendMessage(chatId, `Не понимаю я тебя((`);
	});

	bot.on("callback_query", async (msg) => {
		const data = msg.data;
		const chatId = msg.message.chat.id;
		const messageId = msg.message.message_id;

		if (data === "/again") {
			bot.deleteMessage(chatId, messageId);
			return startGame(chatId);
		}
		bot.deleteMessage(chatId, messageId);

		if (data === chats[chatId]) {
			if (info[chatId]) {
				info[chatId].success++;
			}

			return await bot.sendMessage(
				chatId,
				`Ты выбрал ${data} и ты... Угадал!`,
				gameAgain
			);
		} else {
			if (info[chatId]) {
				info[chatId].reject++;
			}
			return await bot.sendMessage(
				chatId,
				`Ты выбрал ${data} и ты... Не угадал!`,
				gameAgain
			);
		}
	});
};

start();
