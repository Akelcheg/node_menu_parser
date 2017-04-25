import * as express from 'express'
import { ApiRoutes } from './routes/api_routes'
import { FoodBot } from './bot/FoodBot'
import * as weeksObject from '../config/daysWeekRange.json'
import { ExcelParser } from './parser/ExcelParser'

const app: express.Application = express();
const port: number = 3000;

app.use('/api', ApiRoutes);

let foodBot = new FoodBot();
let path = "./data/food.xlsx";
let parsedFile = new ExcelParser(path);

//foodBot.botInstance.sendMessage(32317725,"dsadasdsadas");
//slava chat ID 42346292

foodBot.botInstance.onText(/\/menu/, function onLoveText(msg) {
  let weeks = ['/monday', '/tuesday', '/wednesday', '/thursday', '/friday'];
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        [{
            text: 'Понедельник',
            callback_data: '/monday'
          },'/tuesday'], 
        ['/wednesday','/thursday'], 
        ['/friday']
      ]
    })
  };
  foodBot.botInstance.sendMessage(msg.chat.id, 'На какой день еду показать?', opts);
  //foodBot.botInstance.sendMessage(msg.from.id, 'Original Text', opts);
});


foodBot.botInstance.on('message', (msg) => {
  const chatId = msg.chat.id;
  
  let weeks = ['/monday', '/tuesday', '/wednesday', '/thursday', '/friday'];
  if (weeks.indexOf(msg.text) >= 0) {    
    let message: any = parsedFile.getMenuByWeekDay(msg.text.replace('/', ''));
    message = message.join('\n');
    message = message.replace(/&quot;/g, '"');
    foodBot.botInstance.sendMessage(chatId, message);
  } else foodBot.botInstance.sendMessage(chatId, "тупо пересылаю что мне шлют '" + msg.text + "'");

});

foodBot.botInstance.on('callback_query', function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };
  let text;

  /*if (action === 'edit') {
    text = 'Edited Text';
  }*/
  console.log (action);

  let weeks = ['/monday', '/tuesday', '/wednesday', '/thursday', '/friday'];
  if (weeks.indexOf(action) >= 0) {
    let message: any = parsedFile.getMenuByWeekDay(action.replace('/', ''));
    message = message.join('\n');
    message = message.replace(/&quot;/g, '"');
    foodBot.botInstance.sendMessage(opts.chat_id, message);
  }
  // else foodBot.botInstance.sendMessage(chatId, "тупо пересылаю что мне шлют '" + msg.text + "'");

  //foodBot.botInstance.editMessageText(text, opts);
});



app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`);
});