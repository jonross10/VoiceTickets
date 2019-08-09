
var days = ["sunday","monday", "tuesday", "wednesday", "thursday","friday", "saturday"];
var dayShort = ["Sun","Mon", "Tues", "Wed", "Thur","Fri", "Sat"];
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var startDate = null;
var endDate = null;

function timeframeOutput(output){
  var out = ""
  for(var i=0;i<output.length;i++){
    var title =output[i]["title"];
    if(title.includes(":"))
      title = title.split(":")[1];
    if(output[i]["stats"]["lowest_price"])
      out+="Tickets start at $"+output[i]["stats"]["lowest_price"]+" for the "+title.split(" at")[0]+" game on "+formatDate(output[i]["datetime_local"]);
  }
  if(out.trim().length>0)
    out+=" Would you like me to email you links to these tickets"
  if(output.length>5 && !longMessageReprompt){
    out = "there are more than 5 games in this response, do you still want me to read them"
    longMessageReprompt = true;
  }
  return out;
}
function formatDate(date){
  var gameDate = new Date(date);
  return days[gameDate.getDay()]+" "+months[gameDate.getMonth()]+" "+gameDate.getDate()+"th. ";
}

function formatDate2(date){
  var gameDate = new Date(date);
  return dayShort[gameDate.getDay()]+" "+months[gameDate.getMonth()]+" "+gameDate.getDate();
}
function getTimeFrame(timeframe){
  console.log("timeframe: "+timeframe);
  if(timeframe)
    var datesObj = getDateFromSlot(timeframe);
  else
    var datesObj = getDateFromSlot((new Date()).getMonth()+1+"-"+(new Date()).getDate()+"-"+(new Date()).getFullYear());
  console.log(datesObj);
  startDate = new Date(datesObj["startDate"]);
  endDate = new Date(datesObj["endDate"]);
  return "datetime_utc.gte="+startDate.getFullYear()+"-"+(startDate.getMonth()+1)+"-"+startDate.getDate()+"&datetime_utc.lte="+endDate.getFullYear()+"-"+(endDate.getMonth()+1)+"-"+endDate.getDate();

}

//********************* AMAZON get JS Date functions from slot *****************************************************//

function getDateFromSlot(rawDate) {
    // try to parse data
    let date = new Date(Date.parse(rawDate));
    // create an empty object to use later
    let eventDate = {

    };

    // if could not parse data must be one of the other formats
    if (isNaN(date)) {
        // to find out what type of date this is, we can split it and count how many parts we have see comments above.
        const res = rawDate.split("-");
        // if we have 2 bits that include a 'W' week number
        if (res.length === 2 && res[1].indexOf('W') > -1) {
            let dates = getWeekData(res);
            eventDate["startDate"] = new Date(dates.startDate);
            eventDate["endDate"] = new Date(dates.endDate);
            // if we have 3 bits, we could either have a valid date (which would have parsed already) or a weekend
        } else if (res.length === 3) {
            let dates = getWeekendData(res);
            eventDate["startDate"] = new Date(dates.startDate);
            eventDate["endDate"] = new Date(dates.endDate);
            // anything else would be out of range for this skill
        } else {
            eventDate["error"] = dateOutOfRange;
        }
        // original slot value was parsed correctly
    } else {
      if(rawDate.split("-").length==2){ // is passing in a month
        eventDate["startDate"] = new Date(date).setUTCHours(5, 0, 0, 0);
        eventDate["endDate"] = new Date(date.getFullYear(),date.getMonth()+1);
      } else{
        eventDate["startDate"] = new Date(date).setUTCHours(5, 0, 0, 0);
        eventDate["endDate"] = new Date(date).setUTCHours(24+5, 0, 0, 0);
      }
    }
    return eventDate;
}

// Given a week number return the dates for both weekend days
function getWeekendData(res) {
    if (res.length === 3) {
        const fridayIndex = 4;
        const sundayIndex = 6;
        const weekNumber = res[1].substring(1);

        const weekStart = w2date(res[0], weekNumber, fridayIndex);
        const weekEnd = w2date(res[0], weekNumber, sundayIndex);

        return {
            startDate: weekStart,
            endDate: weekEnd,
        };
    }
}

// Given a week number return the dates for both the start date and the end date
function getWeekData(res) {
    if (res.length === 2) {

        const mondayIndex = 0;
        const sundayIndex = 6;

        const weekNumber = res[1].substring(1);

        const weekStart = w2date(res[0], weekNumber, mondayIndex);
        const weekEnd = w2date(res[0], weekNumber, sundayIndex);

        return {
            startDate: weekStart,
            endDate: weekEnd,
        };
    }
}

// Used to work out the dates given week numbers
const w2date = function (year, wn, dayNb) {
    const day = 86400000;

    const j10 = new Date(year, 0, 10, 12, 0, 0),
        j4 = new Date(year, 0, 4, 12, 0, 0),
        mon1 = j4.getTime() - j10.getDay() * day;
    return new Date(mon1 + ((wn - 1) * 7 + dayNb) * day);
};

function getWeek(date) {
/*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.epoch-calendar.com */
  date = new Date(date);
  var dowOffset = 0; //default dowOffset to zero
  var newYear = new Date(date.getFullYear(),0,1);
  var day = newYear.getDay() - dowOffset; //the day of week the year begins on
  day = (day >= 0 ? day : day + 7);
  var daynum = Math.floor((date.getTime() - newYear.getTime() - 
  (date.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
  var weeknum;
  //if the year starts before the middle of a week
  if(day < 4) {
    weeknum = Math.floor((daynum+day-1)/7) + 1;
    if(weeknum > 52) {
      nYear = new Date(date.getFullYear() + 1,0,1);
      nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      /*if the next year starts before the middle of
        the week, it is week #1 of that year*/
      weeknum = nday < 4 ? 1 : 53;
    }
  }
  else {
    weeknum = Math.floor((daynum+day-1)/7);
  }
  console.log(date.getFullYear()+"-W"+weeknum);
  return date.getFullYear()+"-W"+weeknum;
};