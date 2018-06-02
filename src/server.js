import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import morgan from 'morgan';
import botkit from 'botkit';
import yelp from 'yelp-fusion';

dotenv.config({ silent: true });

// initialize
const app = express();
let name = '';
let rating = '';
let imagee = '';

// enable/disable cross origin resource sharing if necessary
app.use(cors());

// enable/disable http request logging
app.use(morgan('dev'));

// enable only if you want templating
app.set('view engine', 'ejs');

// enable only if you want static assets from folder static
app.use(express.static('static'));

// this just allows us to render ejs from the ../app/views directory
app.set('views', path.join(__dirname, '../src/views'));

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// botkit controller
const controller = botkit.slackbot({
  debug: false,
});

// initialize slackbot
const slackbot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN,
  // this grabs the slack token we exported earlier
}).startRTM((err) => {
  // start the real time message client
  if (err) { throw new Error(err); }
});

// prepare webhook
// for now we won't use this but feel free to look up slack webhooks
controller.setupWebserver(process.env.PORT || 3001, (err, webserver) => {
  controller.createWebhookEndpoints(webserver, slackbot, () => {
    if (err) { throw new Error(err); }
  });
});

// example hello response
controller.hears(['hello', 'hi', 'howdy', 'hola', 'hey'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  // bot.reply(message, 'Hello there!');
  bot.api.users.info({ user: message.user }, (err, res) => {
    if (res) {
      const namestring = res.user.name;
      console.log(namestring);
      const nameA = namestring.split('.');
      const name2 = `${nameA[0]} ${nameA[2]}`;
      bot.reply(message, `Hello, ${name2}!`);
    } else {
      bot.reply(message, 'Hello there!');
    }
  });
});


controller.hears(['hungry', 'hi im hungry', 'food'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'Would you like food recommendations?');
});


controller.hears(['yea', 'yes', 'yes please'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'Great, What type of food are u interested in?');
});

controller.hears(['yea', 'yes', 'yes please'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'Great, What type of food are u interested in?');
});

controller.hears(['no', 'no im good', 'nah', 'no thank you'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'okay, Have a good day and be sure to come again!');
});

controller.hears(['icecream', 'ice cream', 'corn', 'cheese', 'chips', 'tacos', 'fish', 'burger', 'pizza', 'fries'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  const term2 = message.match[0];
  const yelpClient = yelp.client(process.env.YELP_CLIENT_ID);

  yelpClient.search({
    term: term2,
    location: 'hanover, nh',
  }).then((response) => {
    // console.log(response.jsonBody.businesses[0].name);
    // console.log(response.jsonBody.businesses[0]);

    name = response.jsonBody.businesses[0].name;
    rating = response.jsonBody.businesses[0].rating;
    imagee = response.jsonBody.businesses[0].image_url;
    const response2 = `You should try '${name}' \n Rated ${rating} stars \n ${imagee}`;

    bot.reply(message, response2);
    // response.jsonBody.businesses.forEach((business) => {
    //   console.log(business.name);
    //   name = business.name;
    //   rating = business.rating;
    //   text = business.snippet_text;
    // });
    // sushi = response.jsonBody.businesses;
  }).catch((e) => {
    console.log(e);
  });
});

controller.hears(['help', 'help me', 'im dying'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'How may I help you? I am JoleneBot I can help you look for restaruants based on foods you like!');
});

controller.hears(['Who are you?', 'What do you do?'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'I am JoleneBot I can help you look for restaruants based on foods you like!');
});

controller.hears(['string', 'pattern .*', new RegExp('.*', 'i')], ['direct_message', 'direct_mention', 'mention', 'message_received', 'other_event'], (bot, message) => {
  bot.reply(message, 'what you talking about willis?');
});

// controller.on('user_typing', (bot, message) => {
//   bot.reply(message, 'stop typing!');
// });


// default index route
app.get('/', (req, res) => {
  res.send('hi');
});

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
app.listen(port);

console.log(`listening on: ${port}`);
