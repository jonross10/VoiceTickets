
var WELCOME = 'Welcome to the Voice Tickets Alexa skill. Ask me about ticket prices or say help to learn how.';
var AUTHENTICATE = 'to get messages from this skill, please use the alexa app to authenticate on Amazon';
var SORRY_AWS_PROFILE = "Sorry, I can't connect to Amazon Profile Service right now, try again later";
var EMAIL_YES_NO = "Ok, Would you like me to email you links to these tickets and their prices";
var UTTER_RETRY = 'I didn\'t quite get that. Ask '+getRandomPrompt()+' or something similar to hear results.'
var UTTER_GOODBYE = "Goodbye";
var HELP = `Hello! 
          You can ask me about home ticket prices for your favorite sports teams!
          For example, to hear ticket prices for Red Sox tickets in the month of May, ask How much are Red Sox tickets for the month of May?
          You can also ask about prices for a specific date with, How much are Red Sox tickets on May 1st? or How much are Red Sox tickets tonight? or How much are Red Sox tickets tomorrow?
          Or, to hear prices for a smaller range of dates, you can ask something like How much are Red Sox Tickets the week of May 1st to hear prices for all of the home games that week. You can also
          ask How much are Red Sox tickets this week? to hear prices for games this week, or say How much are Red Sox tickets this weekend to hear prices for this weekend.
          After you hear the ticket prices if you want to buy tickets, I can send you an email to the account tied to this Echo with links to buy them.`

var QUESTION_TYPES = [
  "How much are Red Sox tickets in the month of May",
  "How much are Red Sox tickets on April 5th",
  "How much are Celtics tickets this week",
  "How much Bruins tickets today",
  "What are the Bruins ticket prices for this weekend",
  "How much are Celtics tickets tonight",
  "How much are Red Sox tickets the week of September 1st"
]

function getRandomPrompt(){
  var randomNumber = Math.floor(Math.random()*QUESTION_TYPES.length);
  return QUESTION_TYPES[randomNumber];
}