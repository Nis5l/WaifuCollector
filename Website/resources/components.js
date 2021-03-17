class ProgressRing extends HTMLElement {
	constructor() {
		super();
		const stroke = this.getAttribute("stroke");
		const radius = this.getAttribute("radius");
		this.radius = radius;
		const normalizedRadius = radius - stroke * 2;
		this.time = this.getAttribute("time");
		this._circumference = normalizedRadius * 2 * Math.PI;

		this._root = this.attachShadow({mode: "open"});
		this._root.innerHTML = `
      <svg
        height="${radius * 2}"
        width="${radius * 2}"
       >
         <style>
          margin: auto;
          padding: auto;
         </style>
         <circle
           stroke="white"
           stroke-dasharray="${this._circumference} ${this._circumference}"
           style="stroke-dashoffset:${this._circumference}"
           stroke-width="${stroke}"
           fill="transparent"
           r="${normalizedRadius}"
           cx= 50%
           cy= 50%
        />
        <text font-size=32pt x="50%" y="50%" text-anchor="middle" fill="#fff" dy=".38em">${this.time
			}</text>
      </svg>
      
      <style>
        svg
        {
          width: 100%;
          height: 100%;
          position: relative;
        }
        circle {
          transition: stroke-dashoffset 0.35s;

		  transition: fill-opacity 0.25s linear; 

          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }

        text
        {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      </style>
    `;
	}

	setProgress(percent) {
		const offset = this._circumference - (percent / 100) * this._circumference;
		const circle = this._root.querySelector("circle");
		if (percent == 100) {
			circle.style.fill = "rgba(214, 214, 214)";
			circle.style.fillOpacity = "0.06";
		}
		circle.style.strokeDashoffset = offset;
	}

	setTime(time) {
		const text = this._root.querySelector("text");
		if (time != 0) {
			var ft = formatTime(time);
			this.time = ft;
		} else this.time = "Open";
		text.innerHTML = this.time;
	}

	static get observedAttributes() {
		return ["progress", "time"];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "progress") {
			this.setProgress(newValue);
		}
		if (name === "time") {
			this.setTime(newValue);
		}
	}

	isReady() {
		return this.time == 0 || this.time == "Open";
	}

	isClicked(x, y) {
		if (this.time != 0 && this.time != "Open") return;
		const circle = this._root.querySelector("circle");
		const circleX =
			circle.getBoundingClientRect().right -
			(circle.getBoundingClientRect().right -
				circle.getBoundingClientRect().left) /
			2;
		const circleY =
			circle.getBoundingClientRect().top -
			(circle.getBoundingClientRect().top -
				circle.getBoundingClientRect().bottom) /
			2;
		const ret =
			Math.sqrt((circleX - x) * (circleX - x) + (circleY - y) * (circleY - y)) <
			this.radius;
		if (ret) {
			circle.style.fillOpacity = "0.5";
			return ret;
		}
	}

	setFocused(b) {
		const circle = this._root.querySelector("circle");
		if (b) circle.style.fillOpacity = "0.5";
		else circle.style.fillOpacity = "0.06";
	}
}

function formatTime(t) {
	var seconds = Math.floor((t / 1000) % 60);
	if (("" + seconds).length == 1) seconds = "0" + seconds;
	var minutes = Math.floor((t / (60 * 1000)) % 60);
	if (("" + minutes).length == 1) minutes = "0" + minutes;
	var hours = Math.floor((t / (60 * 60 * 1000)) % 24);
	if (("" + hours).length == 1) hours = "0" + hours;
	var days = Math.floor(t / (60 * 60 * 24 * 1000));
	if (("" + days).length == 1) days = "0" + days;
	var formatTime = days + ":" + hours + ":" + minutes + ":" + seconds;
	if (days == "00") {
		formatTime = hours + ":" + minutes + ":" + seconds;
		if (hours == "00") {
			formatTime = minutes + ":" + seconds;
			if ((minutes == "00")) {
				formatTime = seconds;
			}
		}
	}
	return formatTime;
}

class Card extends HTMLElement {
	constructor() {
		super();
		const img = this.getAttribute("img_path");
		const effect = this.getAttribute("effect_path");
		const effectopacity = this.getAttribute("effect_opacity");
		const frame_front = this.getAttribute("frame-front");
		const frame_back = this.getAttribute("frame-back");
		const card_name = this.getAttribute("card-name");
		const anime_name = this.getAttribute("anime-name");
		const posX = this.getAttribute("pos-x");
		const turned = this.getAttribute("turned") == "true";
		const quality = this.getAttribute("quality");
		const level = this.getAttribute("level");
		const size = parseFloat(this.getAttribute("card-size"));
		this.level = level;
		this.uuid = this.getAttribute("uuid");
		this.cardID = this.getAttribute("cardID");
		this.backcolor = this.getAttribute("backcolor");
		this.identifier = this.getAttribute("identifier");
		this.shadow = this.attachShadow({mode: "open"});
		this.turned = turned;
		//this._root.innerHTML =`
		this.shadow.innerHTML = `
    <div class="card" id=card> 
      <div class="card-inner" id="card-inner">
      </div>  
      <div class="card-effect">
      </div>  
      <div class="card-color">
      </div>  
      <div class="waifu-card-back">
      </div>
      <div class="waifu-card">     
      </div>
      <div class="card-name">
        <div>${card_name}</div>
      </div>
      <div class="anime-name">
        <div>${anime_name}</div>
      </div>
      <div class="quality">
        <div>${quality}</div>
      </div>
      <div class="level">
        <div>${level}</div>
      </div>
    </div>
    <link href='https://fonts.googleapis.com/css?family=Allerta Stencil' rel='stylesheet'>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@1,700&display=swap');
      .card
      {
		cursor: pointer;
        float: left;
        margin: 10px;
        margin-top: 2%;
        width: ${253 * size}px;
        height: ${402 * size}px;
        position: relative;
        transform: translateX(${posX}%);
      }

      .card-inner
      {
        background-color: transparent;
        background-image: url(${img});
        background-size: 100%;
        background-repeat: no-repeat;
		margin-left: 10%;
		margin-top: 11%;
        transition-duration: 1s;
        width: 78%;
        height: 78%;
        backface-visibility: hidden;
        transform: rotateY(${turned ? 180 : 0}deg);
      }

      .card-effect
      {
        background-color: transparent;
		${effect == null ||
				effect == undefined ||
				effect == "undefined" ||
				effect == "null"
				? "//"
				: ""
			}background-image: url(${effect});
		${effectopacity == null ||
				effectopacity == undefined ||
				effectopacity == "undefined" ||
				effectopacity == "null"
				? "//"
				: ""
			}opacity: ${effectopacity};
        background-size: 100%;
        background-repeat: no-repeat;
		margin-left: 11.8%;
		margin-top: 13%;
        transition-duration: 1s;
        width: 76%;
        height: 76%;
        backface-visibility: hidden;
        transform: rotateY(${turned ? 180 : 0}deg);
		position: absolute;
		top: 0;
		left: 0;
      }

      .card-color
      {
		position: absolute;
		background-color: ${this.backcolor == null ? "transparent" : this.backcolor};
        background-size: 100%;
		margin-left: 10%;
		margin-top: 11%;
        transition-duration: 1s;
        width: 78%;
        height: 78%;
        backface-visibility: hidden;
        transform: rotateY(${turned ? 180 : 0}deg);
		top: 0;
		left: 0;
      }

      .waifu-card
      {
        background-color: transparent;
        background-image: url(${frame_front});
        background-size: 100% 92%;
        background-repeat: no-repeat;
        background-position: 0% 0%;
        transition-duration: 1s;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        backface-visibility: hidden;
        transform: rotateY(${turned ? 180 : 0}deg);
      }

      .waifu-card-back
      {
        background-color: transparent;
        background-image: url(${frame_back});
        background-size: 100% 92%;
        background-repeat: no-repeat;
        width: 100%;
        height: 100%;
        transition-duration: 1s;
        backface-visibility: hidden;
        position: absolute;
        top: 0;
        left: 0;
        transform: rotateY(${turned ? 0 : 180}deg);
        /*transform: rotateY(360deg);*/
      }

      .card-name
      {
        display: flex;
        text-align: center;
        justify-content: center;
        align-items: center;
        color: black;
        position: absolute;
        top: 2%;
        left: 0;
        width: 48%;
        height: 7%;
        transition: transform 1s;
        backface-visibility: hidden;
        transform: rotateY(${turned ? 180 : 0}deg);
        margin-left: 23%;
        line-height: normal;
        transform-origin: inherit;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        font-family: 'Allerta Stencil', sans-serif;
      }

      .anime-name
      {
        display: flex;
        text-align: center;
        justify-content: center;
        align-items: center;
        color: black;
        position: absolute;
        top: 83.5%;
        left: 0;
        width: 48%;
        height: 7%;
        transition: transform 1s;
        backface-visibility: hidden;
        transform: rotateY(${turned ? 180 : 0}deg);
        margin-left: 33%;
        line-height: normal;
        transform-origin: inherit;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        font-family: 'Allerta Stencil', sans-serif;
      }

      .quality
      {
        font-size: 300%;
        display: flex;
        text-align: center;
        color: #dbdbdb;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0%;
        left: -1%;
        width: 11%;
        height: 7%;
        transition: transform 1s;
        backface-visibility: hidden;
        transform: rotateY(${turned ? 180 : 0}deg);
        margin-left: 0%;
        line-height: 170%;
        transform-origin: inherit;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        font-family: 'Allerta Stencil', sans-serif;
        -webkit-text-stroke-color: black;
        -webkit-text-stroke-width: 1px;
        transform-origin: top center;
      }

      .level
      {
        font-size: 300%;
        display: flex;
        text-align: center;
        justify-content: center;
        align-items: center;
        color: #ffd600;
        position: absolute;
        top: 3%;
        left: 85%;
        width: 11%;
        height: 7%;
        transition: transform 1s;
        backface-visibility: hidden;
        transform: rotateY(${turned ? 180 : 0}deg);
        margin-left: 0%;
        line-height: 170%;
        transform-origin: inherit;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        font-family: 'Allerta Stencil', sans-serif;
        -webkit-text-stroke-color: black;
        -webkit-text-stroke-width: 1px;
        transform-origin: top center;
      }
      </style>
    `;
		this.fit();
	}
	isClicked(x, y) {
		const card = this.shadow.querySelector(".card");
		return (
			x < card.getBoundingClientRect().right &&
			x > card.getBoundingClientRect().left &&
			y < card.getBoundingClientRect().bottom &&
			y > card.getBoundingClientRect().top
		);
	}

	getDiv() {
		return $(".card");
	}

	fit() {
		while (
			$(this.shadow).find(".anime-name div").height() >
			$(this.shadow).find(".anime-name").height() &&
			parseInt($(this.shadow).find(".anime-name div").css("font-size")) > 0
		) {
			$(this.shadow)
				.find(".anime-name div")
				.css(
					"font-size",
					parseInt($(this.shadow).find(".anime-name div").css("font-size")) -
					1 +
					"px"
				);
		}

		while (
			$(this.shadow).find(".card-name div").height() >
			$(this.shadow).find(".card-name").height() &&
			parseInt($(this.shadow).find(".card-name div").css("font-size")) > 0
		) {
			$(this.shadow)
				.find(".card-name div")
				.css(
					"font-size",
					parseInt($(this.shadow).find(".card-name div").css("font-size")) -
					1 +
					"px"
				);
		}
	}
	//src="https://code.jquery.com/jquery-3.5.1.js"
	//integrity="sha256-QWo7LDvxbWT2tbbQ97B53yJnYU3WhH/C8ycbRAkjPDc="
	//crossorigin="anonymous"

	getTurned() {
		return this.turned;
	}

	turn() {
		$(this.shadow).find(".card-inner").css("transform", "rotateY(0deg)");
		$(this.shadow).find(".waifu-card").css("transform", "rotateY(0deg)");
		$(this.shadow).find(".waifu-card-back").css("transform", "rotateY(180deg)");
		$(this.shadow).find(".card-name").css("transform", "rotateY(0deg)");
		$(this.shadow).find(".anime-name").css("transform", "rotateY(0deg)");
		$(this.shadow).find(".quality").css("transform", "rotateY(0deg)");
		$(this.shadow).find(".level").css("transform", "rotateY(0deg)");
		this.turned = false;
	}
}

class Confirmation extends HTMLElement {
	constructor() {
		super();

		this._root = this.attachShadow({mode: "open"});
		this.noCallback = undefined;
		this.yesCallback = undefined;
		this.message = this.getAttribute("message");

		var widthsub = 0;
		if ($(document).width() <= 400) widthsub = 80;

		this._root.innerHTML = `
            <div class="card">
                    <h1>${this.message}</h1>

                    <input class=no type="submit" name="submit" value="No">
                    <input class=yes type="submit" name="submit" value="Yes">

            </div>
			<style>
	.card {
    position: fixed;
    top: 50%;
    left: 50%;
    width: calc(300px - ${widthsub}px);
    transform: translate(-50%, -50%);
    background-color: #25282f;
    padding: 40px;
    text-align: center; }
    .card h1 {
      margin-top: 20px;
      color: white;
      display: block; }
    .card .wrong {
      border-color: red !important; }
    .card input[type="submit"] {
      color: #f7f7f7;
      padding: 10px 30px;
      margin: auto 10px;
      border: 2px solid #fff;
      background-color: #323232;
      border-radius: 25px;
	  cursor: pointer;}
      .card input[type="submit"]:enabled:hover {
        color: #fff;
        background-color: rgba(0, 0, 0, 0);
        transition: background 0.2s ease-in-out; }
      .card input[type="submit"]:disabled {
        background-color: #202320;
        border-color: #202320; }
	</style>
    `;
		var ele = this._root.querySelector(".no");
		ele.onclick = () => {
			if (this.noCallback != undefined) this.noCallback();
		};

		var ele = this._root.querySelector(".yes");
		ele.onclick = () => {
			if (this.yesCallback != undefined) this.yesCallback();
		};
	}
}

class ConfirmationCancel extends HTMLElement {
	constructor() {
		super();

		this._root = this.attachShadow({mode: "open"});
		this.noCallback = undefined;
		this.yesCallback = undefined;
		this.cancelCallback = undefined;
		this.message = this.getAttribute("message");

		var widthsub = 0;
		if ($(document).width() <= 400) widthsub = 80;

		this._root.innerHTML = `
            <div class="card">
                    <h1>${this.message}</h1>

                    <input class=no type="submit" name="submit" value="No">
                    <input class=yes type="submit" name="submit" value="Yes">
					<input class=cancel style="margin-top: 8px;" type="submit" name="submit" value="Cancel">
            </div>
			<style>
	.card {
    position: fixed;
    top: 50%;
    left: 50%;
    width: calc(300px - ${widthsub}px);
    transform: translate(-50%, -50%);
    background-color: #25282f;
    padding: 40px;
    text-align: center; }
    .card h1 {
      margin-top: 20px;
      color: white;
      display: block; }
    .card .wrong {
      border-color: red !important; }
	.card .cancel {
		margin-top: 8px;
		width: 63%;
	}
    .card input[type="submit"] {
      color: #f7f7f7;
      padding: 10px 30px;
      margin: auto 10px;
      border: 2px solid #fff;
      background-color: #323232;
      border-radius: 25px;
	  cursor: pointer;}
      .card input[type="submit"]:enabled:hover {
        color: #fff;
        background-color: rgba(0, 0, 0, 0);
        transition: background 0.2s ease-in-out; }
      .card input[type="submit"]:disabled {
        background-color: #202320;
        border-color: #202320; }
	</style>
    `;
		var ele = this._root.querySelector(".no");
		ele.onclick = () => {
			if (this.noCallback != undefined) this.noCallback();
		};

		var ele = this._root.querySelector(".yes");
		ele.onclick = () => {
			if (this.yesCallback != undefined) this.yesCallback();
		};

		var ele = this._root.querySelector(".cancel");
		ele.onclick = () => {
			if (this.cancelCallback != undefined) this.cancelCallback();
		};
	}
}

class AddFriend extends HTMLElement {
	constructor() {
		super();

		this._root = this.attachShadow({mode: "open"});
		this.noCallback = undefined;
		this.yesCallback = undefined;

		var widthsub = 0;
		if ($(document).width() <= 400) widthsub = 80;

		this._root.innerHTML = `
            <div class="card">
                    <h1>Add Friend</h1>

                    <input class=username type="text" name="username" placeholder="Name">
                    <input class=no type="submit" name="submit" value="Cancel">
                    <input class=yes type="submit" name="submit" value="Yes">

            </div>
			<style>
	.card {
    position: fixed;
    top: 50%;
    left: 50%;
    width: calc(300px - ${widthsub}px);
    transform: translate(-50%, -50%);
    background-color: #25282f;
    padding: 40px;
    text-align: center; }
    .card h1 {
      margin-top: 20px;
      color: white;
      display: block; }
    .card .wrong {
      border-color: red !important; }
    .card input[type="submit"] {
      color: #f7f7f7;
      padding: 10px 10px;
      margin: auto 10px;
      border: 2px solid #fff;
      background-color: #323232;
      border-radius: 25px;
	  width: calc(125px - ${widthsub}px / 2);
	  cursor: pointer;
	  }
      .card input[type="submit"]:enabled:hover {
        color: #fff;
        background-color: rgba(0, 0, 0, 0);
        transition: background 0.2s ease-in-out; }
      .card input[type="submit"]:disabled {
        background-color: #202320;
        border-color: #202320; }
      .card input[type="text"] {
            color: #fff;

            background: none;
            display: block;

            text-align: center;

            border: 2px solid rgba(255, 255, 255, 0.25);

            width: calc(280px - ${widthsub}px);
            outline: none;

            margin: 20px auto;
            padding: 10px 4px;

            border-radius: 25px;
        }
      .card input[type="text"]:hover{

                border-color: #fff;

                transition: border 0.2s ease-in-out;

		}
	</style>
    `;
		this.username = this._root.querySelector(".username");
		var ele = this._root.querySelector(".no");
		ele.onclick = () => {
			if (this.noCallback != undefined) this.noCallback();
		};

		var ele = this._root.querySelector(".yes");
		ele.onclick = () => {
			if (this.yesCallback != undefined) this.yesCallback();
		};
	}
}

class Friend extends HTMLElement {
	constructor() {
		super();

		this._root = this.attachShadow({mode: "open"});
		this.username = this.getAttribute("username");
		this.userID = this.getAttribute("userID");
		this.status = this.getAttribute("status");
		switch (this.status) {
			case "0": {
				this.statusMessage = "Pending";
				break;
			}
			case "1": {
				this.statusMessage = "Sent";
				break;
			}
			case "2": {
				this.statusMessage = "Friend";
				break;
			}
		}

		this._root.innerHTML = `
            <div class="card">
					<h1 class=status>${this.statusMessage}</h1>
                    <h1 class=username>${this.username}</h1>
            </div>
		<link href='https://fonts.googleapis.com/css?family=Allerta Stencil' rel='stylesheet'>
		<style>
		  @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@1,700&display=swap');
		.card {
		position: relative;
		float: left;
		margin: 10px;
		width: 260px;
		height: 120px;
		background-color: #25282f;
		padding: 10px;
		font-family: 'Allerta Stencil', sans-serif;
		text-align: center;
		cursor: pointer;
		}
		.card .username {
		  margin-top: 26px;
		  color: white;
		  display: block; }
		.card .status {
		  font-size: 12pt;
		  margin-top: 0px;
		  text-align: left;
		  color: white;
		  display: block; }
		</style>
		`;
	}
}

class FriendSelection extends HTMLElement {
	constructor() {
		super();

		this._root = this.attachShadow({mode: "open"});
		this.username = this.getAttribute("username");
		this.tradeCallback = undefined;
		this.deleteCallback = undefined;
		var widthsub = 0;
		if ($(document).width() <= 400) widthsub = 50;

		this._root.innerHTML = `
            <div class="card">
                    <h1>${this.username}</h1>
					<div class="trade">Trade</div>
					<div class="delete">Delete</div>
            </div>
			<style>
	.card {
    position: fixed;
    top: 50%;
    left: 50%;
    width: calc(300px - ${widthsub}px);
    transform: translate(-50%, -50%);
    background-color: #25282f;
    padding: 10px;
	height: 350px;
	z-index: 1000;
    text-align: center; }
    .card h1 {
      color: white;
	  margin-top: 25px;
	  margin-bottom: 0px;
      display: block;
	  border-bottom: 1px solid #ffff;
	  padding-bottom: 25px;
	  }
    .card .trade {
	  margin: 0px;
	  padding: 0px;
      color: white;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  width: calc(300px - ${widthsub}px);
	  height: 190px;
	  border-bottom: 1px solid #ffff;
      font-size: 24pt;
	  cursor: pointer;
	  }
    .card .delete {
      color: white;
      display: flex;
	  align-items: center;
	  justify-content: center;
	  vertical-align:middle;
	  height: 80px;
	  font-size: 16pt;
	  cursor: pointer;
	  }
	</style>
    `;
		var ele1 = this._root.querySelector(".trade");
		ele1.onclick = () => {
			$(ele1).css("background-color", "rgba(255, 255, 255, 0.1)");
			if (this.tradeCallback != undefined) this.tradeCallback();
		};

		var ele2 = this._root.querySelector(".delete");
		ele2.onclick = () => {
			$(ele2).css("background-color", "rgba(255, 255, 255, 0.1)");
			if (this.deleteCallback != undefined) this.deleteCallback();
		};
	}
}

class CookieConfirmation extends HTMLElement {
	constructor() {
		super();

		this._root = this.attachShadow({mode: "open"});
		this.okCallback = undefined;

		var widthsub = 0;
		if ($(document).width() <= 400) widthsub = 80;

		this._root.innerHTML = `
            <div class="card">
                    <h1>This Website uses Cookies</h1>
					<a href="/privacy">More Information</a>

                    <input class=ok type="submit" name="submit" value="OK">

            </div>
			<style>
	.card {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 300px;
    transform: translate(-50%, -50%);
    background-color: #25282f;
    padding: 40px;
	height: 300px;
	width: calc(300px - ${widthsub}px);
    text-align: center; }
    .card h1 {
      margin-top: 20px;
      color: white;
      display: block;
	  font-size: 24pt;
	  }
	.card a {
      color: white;
      display: block;
	  font-size: 18pt;
	}
    .card .wrong {
      border-color: red !important; }
    .card input[type="submit"] {
	  cursor: pointer;
      color: #f7f7f7;
      padding: 20px 30px;
      border: 2px solid #fff;
      background-color: #323232;
      border-radius: 25px;
	  width: calc(300px - ${widthsub}px);
	  position: absolute;
	  bottom: 30px;
	  transform: translate(-50%);
	  font-size: 21pt;
	  }

      .card input[type="submit"]:enabled:hover {
        color: #fff;
        background-color: rgba(0, 0, 0, 0);
        transition: background 0.2s ease-in-out; }
      .card input[type="submit"]:disabled {
        background-color: #202320;
        border-color: #202320; }
      .card input[type="text"] {
            color: #fff;

            background: none;
            display: block;

            text-align: center;

            border: 2px solid rgba(0, 255, 0, 0.25);
		    width: calc(280px - ${widthsub}px);
            outline: none;

            margin: 20px auto;
            padding: 10px 4px;

            border-radius: 25px;
        }
      .card input[type="text"]:hover{

                border-color: #00ff00;

                transition: border 0.2s ease-in-out;

		}
	</style>
    `;
		var ele = this._root.querySelector(".ok");
		ele.onclick = () => {
			if (this.okCallback != undefined) this.okCallback();
		};
	}
}

class NotificationBox extends HTMLElement {
	constructor() {
		super();

		this._root = this.attachShadow({mode: "open"});
		this.closeCallback = undefined;
		this.elementCallback = undefined;
		this.deleteAllCallback = undefined;

		this._root.innerHTML = `
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
			<div class="blocker">
				<div class="box">
					<div class="header">
						<i class="delete fa fa-trash" style="color: #fff; float: right; z-index: 10002; padding-right: 20px; cursor: pointer;"></i>
						Notifications
					</div>
				</div>
            </div>
			<style>
	.blocker {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		height: 100%;
		z-index: 1000;
		background-color: rgba(50, 50, 50, 0.5);
	}
	.blocker .box {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80%;
    transform: translate(-50%, -50%);
    background-color: #25282f;
    padding: 10px;
	height: 90%;
	z-index: 1001;
    text-align: center; }
	.blocker .box .header {
		font-size: 18pt;
		padding-top: 10px;
		padding-bottom: 10px;
		margin-bottom: 5px;
		color: white;
		border-bottom: 1px solid white;
	}
	</style>
    `;

		var ele = this._root.querySelector(".blocker");
		ele.onclick = (res) => {
			var cl = res.target.getAttribute("class");
			var tl = res.target.tagName;
			if (
				tl != undefined &&
				tl == "NOTIFICATION-ELEMENT" &&
				this.elementCallback != undefined
			)
				this.elementCallback(res.target.nId, res.target.url);

			if (cl != undefined && cl == "blocker" && this.closeCallback != undefined)
				this.closeCallback();
		};
		ele = this._root.querySelector(".delete");
		ele.onclick = () => {
			if (this.deleteAllCallback != undefined) this.deleteAllCallback();
		};
	}
	clearAll() {
		var ele = this._root.querySelectorAll("notification-element");
		for (var i = 0; i < ele.length; i++) ele[i].remove();
	}
}

class NotificationElement extends HTMLElement {
	constructor() {
		super();

		this._root = this.attachShadow({mode: "open"});
		this.title = this.getAttribute("title");
		this.message = this.getAttribute("message");
		this.url = this.getAttribute("url");
		this.nId = this.getAttribute("nId");

		this._root.innerHTML = `
            <div class="box">
				<div class="title">${this.title}</div>
				<div class="message">${this.message}</div>
            </div>
			<style>
	.box {
   	cursor: pointer;
	margin: auto;
	margin-bottom: 5px;
    width: calc(95% - 40px);
	height: auto;
    background-color: #1c1e23;
    padding: 20px;
	z-index: 1001;
	border: 1px solid white;
    text-align: center; }
	.box .title {
		font-size: 18pt;
		padding: 10px;
		padding-bottom: 20px;
		color: white;
		border-bottom: 1px solid white;
	}
	.box .message {
		font-size: 12pt;
		padding-top: 20px;
		color: white;
	}
	</style>
    `;
	}
}

class ErrorMessage extends HTMLElement {
	constructor() {
		super();

		this._root = this.attachShadow({mode: "open"});
		this.closeCallback = "sdf";
		const message = this.getAttribute("message");

		var widthsub = 0;
		if ($(document).width() <= 400) widthsub = 80;

		this._root.innerHTML = `
			<div class="box">
				<div class="header">
					Error
				</div>
				${message}
			</div>
			<style>
	.box {
	cursor: pointer;
    position: fixed;
    top: 50%;
    left: 50%;
    width: calc(300px - ${widthsub}px);
	color: white;
    transform: translate(-50%, -50%);
    background-color: #25282f;
    padding: 10px;
	height: 300px;
	z-index: 1000;
    text-align: center; }
	.box .header {
		font-size: 18pt;
		padding-top: 10px;
		padding-bottom: 10px;
		margin-bottom: 5px;
		color: white;
		border-bottom: 1px solid white;
	}
	</style>
    `;

		var ele = this._root.querySelector(".box");
		ele.onclick = () => {
			if (this.closeCallback != undefined) this.closeCallback();
		};
	}
}

var script = document.createElement("script");
script.src = "https://code.jquery.com/jquery-3.4.1.min.js";
script.type = "text/javascript";
document.getElementsByTagName("head")[0].appendChild(script);

window.customElements.define("progress-ring", ProgressRing);
window.customElements.define("waifu-card", Card);
window.customElements.define("card-confirmation", Confirmation);
window.customElements.define("card-confirmation-cancel", ConfirmationCancel);
window.customElements.define("add-friend", AddFriend);
window.customElements.define("friend-card", Friend);
window.customElements.define("friend-selection", FriendSelection);
window.customElements.define("cookie-confirmation", CookieConfirmation);
window.customElements.define("notification-box", NotificationBox);
window.customElements.define("notification-element", NotificationElement);
window.customElements.define("error-message", ErrorMessage);
