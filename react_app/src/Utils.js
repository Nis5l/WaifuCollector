function formatTime(t) {
  var seconds = Math.floor((t / 1000) % 60);
  if (("" + seconds).length === 1) seconds = "0" + seconds;
  var minutes = Math.floor((t / (60 * 1000)) % 60);
  if (("" + minutes).length === 1) minutes = "0" + minutes;
  var hours = Math.floor((t / (60 * 60 * 1000)) % 24);
  if (("" + hours).length === 1) hours = "0" + hours;
  var days = Math.floor(t / (60 * 60 * 24 * 1000));
  if (("" + days).length === 1) days = "0" + days;
  var formatTime = days + ":" + hours + ":" + minutes + ":" + seconds;
  if (days === "00") {
    formatTime = hours + ":" + minutes + ":" + seconds;
    if (hours === "00") {
      formatTime = minutes + ":" + seconds;
      if (minutes === "00") {
        formatTime = seconds;
      }
    }
  }
  return formatTime;
}

const MAILREGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

function checkMail(mail) {
  return !MAILREGEX.test(mail);
}

export {formatTime, checkMail};
