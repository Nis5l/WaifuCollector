function formatTime(t) {
  var seconds = Math.floor((t / 1000) % 60);
  if (seconds < 10) seconds = "0" + seconds;
  var minutes = Math.floor((t / (60 * 1000)) % 60);
  if (minutes < 10) minutes = "0" + minutes;
  var hours = Math.floor((t / (60 * 60 * 1000)) % 24);
  if (hours < 10) hours = "0" + hours;
  var days = Math.floor(t / (60 * 60 * 24 * 1000));
  if (days < 10) days = "0" + days;
  var formatTime = days + ":" + hours + ":" + minutes + ":" + seconds;
  if (days === "00") {
    if (hours === "00") {
      if (minutes === "00") {
        formatTime = seconds;
		return formatTime;
      }
      formatTime = minutes + ":" + seconds;
	  return formatTime;
    }
    formatTime = hours + ":" + minutes + ":" + seconds;
    return formatTime;
  }
  return formatTime;
}

function timeSince(date){

  let seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
  let interval = seconds / 31536000;
    
  if (interval > 1) {

      return Math.floor(interval) + " years";

  }

  interval = seconds / 2592000;

  if (interval > 1) {

      return Math.floor(interval) + " months";

  }

  interval = seconds / 86400;

  if (interval > 1) {

      return Math.floor(interval) + " days";

  }

  interval = seconds / 3600;

  if (interval > 1) {

      return Math.floor(interval) + " hours";

  }

  interval = seconds / 60;

  if (interval > 1) {

      return Math.floor(interval) + " minutes";

  }

  if(seconds == 0)
      return "Just now";

  if(seconds < 0)
    return "How tf are you in the future?!";

  return Math.floor(seconds) + " seconds";

}

const MAILREGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

function checkMail(mail) {
  return !MAILREGEX.test(mail);
}

export {formatTime, checkMail, timeSince};
