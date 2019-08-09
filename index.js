'use strict';


const VoiceConstants = require('./constants/VoiceConstants');

const EmailFunctions = require('./functions/EmailFunctions');
const CalendarFunctions = require('./functions/CalendarFunctions');
const SportFunctions = require('./functions/SportFunctions');

const Alexa = require('alexa-sdk');
var https = require('https');
var request = require('request');
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});
var client_id = "NDc5MTI0N3wxNTIwOTQ5NDcwLjM1";

var reprompt = false;
var longMessageReprompt = false;
var TO_EMAIL = "";
var team = "";
var lastOutput = {};


const handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', VoiceConstants.WELCOME);
    },
    'TimeFrames': function() {
      if(reprompt && this.event.request.intent.slots["yesOrNo"]["value"]){
        console.log("yesOrNo Slot : "+this.event.request.intent.slots["yesOrNo"]["value"]);
        if(this.event.request.intent.slots["yesOrNo"]["value"].toLowerCase()=="yes" && !longMessageReprompt){
          reprompt = false;
            //if no amazon token, return a LinkAccount card
          if (this.event.session.user.accessToken == undefined) {
            this.emit(':tellWithLinkAccountCard',VoiceConstants.AUTHENTICATE);
            return;
          }
          var amznProfileURL = 'https://api.amazon.com/user/profile?access_token=';
          amznProfileURL += this.event.session.user.accessToken;
          console.log("accessToken : "+this.event.session.user.accessToken);
          var alexa = this;
          request(amznProfileURL, function(error, response, body) {
            if (response.statusCode == 200) {
              var profile = JSON.parse(body);
              console.log(profile);
              console.log("sending user email....");
              TO_EMAIL = profile.email;
              EmailFunctions.sendEmail(lastOutput,alexa);
            } else {
              console.log(response.statusCode);
              console.log(response.body);
              console.log(error);
              alexa.emit(':tell', VoiceConstants.SORRY_AWS_PROFILE);
            }
          });
        } else if(this.event.request.intent.slots["yesOrNo"]["value"].toLowerCase()=="yes" && longMessageReprompt){
          var alexaSay = CalendarFunctions.timeframeOutput(lastOutput);
          longMessageReprompt=false;
          this.emit(':elicitSlot', 'yesOrNo',alexaSay);
          reprompt = true;
        } else if(this.event.request.intent.slots["yesOrNo"]["value"] && longMessageReprompt){
          longMessageReprompt = false;
          this.emit(":elicitSlot",'yesOrNo',VoiceConstants.EMAIL_YES_NO);
        }else{
          reprompt = false;
          longMessageReprompt = false;
          console.log("reprompt else");
          this.emit(':tell', "Goodbye");
        }
      } else{
        if(this.event.request.intent.slots["team"]["value"]){
          team = SportFunctions.getFullTeamId(this.event.request.intent.slots["team"]["value"]);
          var givenDate = this.event.request.intent.slots["timeframe"]["value"];
          if(this.event.request.intent.slots["theWeekOf"]["value"]){
            console.log("theWeekOf");
            givenDate = CalendarFunctions.getWeek(givenDate);
          }
          var url = "https://api.seatgeek.com/2/events?performers[home_team].slug="+team+"&"+CalendarFunctions.getTimeFrame(givenDate)+"&per_page=30&client_id="+client_id+"&aid=13215";
          console.log(url);
          SportFunctions.queryAPI(url,this,CalendarFunctions.timeframeOutput,"",false);
        } else{
          console.log("didn't get team name");
          this.emit(':ask', VoiceConstants.UTTER_RETRY);
        }
      }
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', VoiceConstants.HELP);
    },
    'AMAZON.CancelIntent': function () {
        console.log("cancel intent");
        this.emit(':tell', VoiceConstants.UTTER_GOODBYE);
    },
    'AMAZON.StopIntent': function () {
        console.log("stop intent");
        this.emit(':tell', VoiceConstants.UTTER_GOODBYE);
    },
    'Unhandled': function () {
        console.log("unhandled intent");
        this.emit(':ask', VoiceConstants.UTTER_RETRY);
    },
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handlers);
    alexa.execute();
};
