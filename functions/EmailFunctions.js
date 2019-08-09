const EmailConstants = require('./constants/EmailConstants');
const CalendarFunctions = require('./CalendarFunctions');

function sendEmail(output,alexa){
  var out =createEmailMsg(output);
  console.log("out : "+out);
  // Create sendEmail params 
  var params = {
    Destination: { /* required */
      ToAddresses: [
        TO_EMAIL,
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
         Charset: "UTF-8",
         Data: out
        },
       },
       Subject: {
        Charset: 'UTF-8',
        Data: getPrettyName()+"tickets from Voice Tickets"
       }
      },
    Source: 'Voice Tickets <jon@voice-tickets.com>', /* required */
  };         

  // Create the promise and SES service object
  var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
  // Handle promise's fulfilled/rejected states
  sendPromise.then(
    function(data) {
        alexa.emit(":tell","Message Sent");
    }).catch(
      function(err) {
        console.error(err, err.stack);
        alexa.emit(":tell","This skill is still in beta mode, so we need to verify your email first. Sending a verification email to "+TO_EMAIL);
        var verifyEmailPromise = new AWS.SES({apiVersion: '2010-12-01'}).verifyEmailIdentity({EmailAddress: TO_EMAIL}).promise();
        verifyEmailPromise.then(
          function(data) {
            alexa.emit(":tell","Email verification initiated");
           }).catch(
            function(err) {
            alexa.emit(":tell","There was an internal error.");
        });
    });
}

function createEmailMsg(output){
  var out = EmailConstants.HEADER+getPrettyName()
            +EmailConstants.INTRO_BEGIN+getPrettyName()
            +"Ticket Prices "+months[startDate.getMonth()]
            +" "+startDate.getDate()+" - "+months[endDate.getMonth()]
            +" "+endDate.getDate()+EmailConstants.INTRO_END;
  for(var i=0;i<output.length;i++){
    var title =output[i]["title"];
    var date = new Date(output[i]["datetime_local"]);
    var strTime = " ";
    if(date.getHours()>12){
      if(date.getMinutes()>=10)
        strTime+=(date.getHours()-12)+":"+date.getMinutes();
      else
        strTime+=(date.getHours()-12)+":0"+date.getMinutes();
    } else if(date.getHours()==12){
        if(date.getMinutes()>=10)
          strTime+=(date.getHours())+":"+date.getMinutes();
        else
          strTime+=(date.getHours())+":0"+date.getMinutes();
    } else{
        if(date.getMinutes()>=10)
          strTime+=date.getHours()+":"+date.getMinutes();
        else
          strTime+=date.getHours()+":0"+date.getMinutes();
    }
    if(title.includes(":"))
      title = title.split(":")[1];
    if(output[i]["stats"]["lowest_price"]){
      out+=EmailConstants..PRICE_ONE
        +"$"+output[i]["stats"]["lowest_price"]+"   "
        +title.split(" at")[0]+"   "+CalendarFunctions.formatDate2(output[i]["datetime_local"])
        +strTime+EmailConstants.PRICE_TWO
        +output[i]["url"]+EmailConstants.PRICE_THREE;
    }
  }
  out+=EmailConstants.END;
  return out;
}
