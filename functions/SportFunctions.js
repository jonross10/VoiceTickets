const SportConstants = require('./constants/SportConstants');


function queryAPI(url,alexa,readOutput,outputStr,txt){
  console.log("url : "+url);
  https.get(url, res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        body = JSON.parse(body);
        console.log(body);
        var output = body["events"];
        lastOutput = output;
        console.log(output);
        if(txt){
          readOutput(output,alexa);
        } else{
          var alexaSay = outputStr+readOutput(output);
          if(alexaSay.trim().length<1){
            alexa.emit(":tell","I'm sorry, I couldn't find any home games that match that criteria");
            reprompt = false;
          } else{
            alexa.emit(':elicitSlot', 'yesOrNo',alexaSay);
            reprompt = true;
          }
        }
      });
    });
}
function getFullTeamId(team){
  team = team.replace("the ","").replace(" night"," knight");
  var index = -1;
  for(var i=0;i<SportConstants.SPORT_TEAMS.length;i++){
  if(SportConstants.SPORT_TEAMS[i]["last_name"].toLowerCase()==team.toLowerCase()||SportConstants.SPORT_TEAMS[i]["first_name"].toLowerCase()==team.toLowerCase()||SportConstants.SPORT_TEAMS[i]["full_name"].toLowerCase()==team.toLowerCase()
    ||SportConstants.SPORT_TEAMS[i]["last_name"].toLowerCase()==(team+"s").toLowerCase() || SportConstants.SPORT_TEAMS[i]["full_name"].toLowerCase()==(team+"s").toLowerCase())
    index =i;
  }
  if(index>=0)
    return SportConstants.SPORT_TEAMS[index]["team_id"];
  else
    return team;
}

function lowestPrice(output){
  var lowestPrice = 1000;
  var index = -1;
  for(var i=0;i<output.length;i++){
    if(output[i]["stats"]["lowest_price"]<lowestPrice){
      lowestPrice = output[i]["stats"]["lowest_price"];
      index = i;
      }
  }
  var gameDate = new Date(output[index]["datetime_local"]);
  var returnStr = days[gameDate.getDay()]+" "+months[gameDate.getMonth()]+" "+gameDate.getDate()+"th. The tickets are $"+lowestPrice;
  return returnStr;
}

function getPrettyName(){
  var teamSplit = team.split("-")
  var teamString ="";
  for(var i =0;i<teamSplit.length;i++){
      teamString+=teamSplit[i][0].toUpperCase()+teamSplit[i].substring(1)+" ";
  }
  return teamString;
}