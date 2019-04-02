const Requester = require('../req/requester');
const config = require('../src/configs');

/// @title TelegramBot
/// Functions responsible for handling our Telegram notifications.
class TelegramBot {
  constructor () {
    this.apiKey = config.telegramBotApiKey;
    this.baseUrl = 'https://api.telegram.org';

    // Group: Getting Lots of Diamonds
    // Set this corresponding chat id to your Telegram key located in the '../src/configs' file
    this.chadId = '-281150412';
  }

  // Call this function with a string to have it sent to our Telegram channel
  async message (txt) {
    let res;
    try {
      res = await this.sendMessage(txt);
    } catch (e) { console.log('ArbTelegramBot API ERROR: ' + res); }
    return res;
  }

  async sendMessage (message) {
    // send a message to the telegram channel
    // ex: https://api.telegram.org/bot[BOT_API_KEY]/sendMessage?chat_id=[MY_CHANNEL_NAME]&text=[MY_MESSAGE_TEXT]
    let url = this.baseUrl;
    url += '/bot' + this.apiKey + '/sendMessage?chat_id=' + this.chadId + '&text=' + message;
    const r = new Requester();

    const res = await r.get(url, {}, 5000);
    return res;
  }
}

module.exports = TelegramBot;
