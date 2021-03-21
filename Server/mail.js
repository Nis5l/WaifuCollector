var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'verify.waifucollector@gmail.com',
    pass: 'WaifuCollectorX3645!'
  }
});

function send(mail, key) {
  var mailOptions = {
    from: 'verify.waifucollector@gmail.com',
    to: mail,
    subject: 'WaifuCollector Verify',
    html: `
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<div style="
		resize: none;
		background-image: url('https://waifucollector.com/assets/homeBackground.png');
		height: fit-content;
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center;
		font-family: Arial, Helvetica, sans-serif;">
		<h1 style="
			color: white;
			font-size: 10vw;
			margin: 0;
			padding-top: 50px;
			text-align: center;
			text-shadow: 2px 2px black">WaifuCollector</h1>
		<p style="
			color: white;
			font-size: 6vw;
			text-align: center;
			margin:0;
			margin-top: 50px;
			text-shadow: 2px 2px black">Thank you for registering!</p>
		<a style="
			display: block;
			color: white;
			font-size: 8vw;
			margin: 0;
			margin-top: 50px;
			padding-bottom: 50px;
			text-align: center;
            text-shadow: 2px 2px black" target="_blank" href="https://waifucollector.com/verify?key=${key}">Click to verify</a>
	</div>`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(mail);
      console.log(error);
      logger.write(mail);
      logger.write(error);
    }
  });
}

module.exports =
{
  send: send,
}
