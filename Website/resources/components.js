class ProgressRing extends HTMLElement {
	constructor() {
		super();
		const stroke = this.getAttribute("stroke");
		const radius = this.getAttribute("radius");
		this.radius = radius;
		const normalizedRadius = radius - stroke * 2;
		this.time = this.getAttribute("time");
		this._circumference = normalizedRadius * 2 * Math.PI;

		this._root = this.attachShadow({ mode: "open" });
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
        <text font-size=32pt x="50%" y="50%" text-anchor="middle" fill="#fff" dy=".38em">${time}</text>
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
          transition: fillOpacity 0.35s;
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
		if (time != 0) this.time = Math.floor(time / 1000) + "s";
		else this.time = "Open";
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
		if (ret) circle.style.fillOpacity = "0.5";
		if (ret) return ret;
	}
}

class Card extends HTMLElement {
	constructor() {
		super();
		const img = this.getAttribute("img_path");
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
		this.shadow = this.attachShadow({ mode: "open" });
		//this._root.innerHTML =`
		this.shadow.innerHTML = `
    <div class="card" id=card> 
      <div class="card-inner id=card-inner">
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
        background-size: 80%;
        background-repeat: no-repeat;
        background-position: 48% 35%;
        transition-duration: 1s;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        transform: rotateY(${turned ? 180 : 0}deg);
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
        line-height: 170%;
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
        line-height: 170%;
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
        justify-content: center;
        align-items: center;
        color: #ffd600;
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
        color: #dbdbdb;
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
			$(this.shadow).find(".anime-name").height()
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
			$(this.shadow).find(".card-name").height()
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

	turn() {
		$(this.shadow).find(".card-inner").css("transform", "rotateY(0deg)");
		$(this.shadow).find(".waifu-card").css("transform", "rotateY(0deg)");
		$(this.shadow).find(".waifu-card-back").css("transform", "rotateY(180deg)");
		$(this.shadow).find(".card-name").css("transform", "rotateY(0deg)");
		$(this.shadow).find(".anime-name").css("transform", "rotateY(0deg)");
		$(this.shadow).find(".quality").css("transform", "rotateY(0deg)");
		$(this.shadow).find(".level").css("transform", "rotateY(0deg)");
	}
}

class Confirmation extends HTMLElement {
	constructor() {
		super();

		this._root = this.attachShadow({ mode: "open" });
		this.noCallback = undefined;
		this.yesCallback = undefined;
		this.message = this.getAttribute("message");

		this._root.innerHTML = `
            <div class="card">
                    <h1>${this.message}</h1>

                    <input class=no type="submit" name="submit" value="No">
                    <input class=yes type="submit" name="submit" value="Yes">

            </div>
			<style>
	.card {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
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
      color: black;
      padding: 10px 30px;
      margin: auto 10px;
      border: 2px solid #00ff00;
      background-color: #00ff00;
      border-radius: 25px; }
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

class AddFriend extends HTMLElement {
	constructor() {
		super();

		this._root = this.attachShadow({ mode: "open" });
		this.noCallback = undefined;
		this.yesCallback = undefined;

		this._root.innerHTML = `
            <div class="card">
                    <h1>Add Friend</h1>

                    <input class=username type="text" name="username" placeholder="Name">
                    <input class=no type="submit" name="submit" value="Cancel">
                    <input class=yes type="submit" name="submit" value="Yes">

            </div>
			<style>
	.card {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
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
      color: black;
      padding: 10px 30px;
      margin: auto 10px;
      border: 2px solid #00ff00;
      background-color: #00ff00;
      border-radius: 25px;
	  width: 125px;
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

            width: 280px;
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

		this._root = this.attachShadow({ mode: "open" });
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
		text-align: center; }
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

var script = document.createElement("script");
script.src = "https://code.jquery.com/jquery-3.4.1.min.js";
script.type = "text/javascript";
document.getElementsByTagName("head")[0].appendChild(script);

window.customElements.define("progress-ring", ProgressRing);
window.customElements.define("waifu-card", Card);
window.customElements.define("card-confirmation", Confirmation);
window.customElements.define("add-friend", AddFriend);
window.customElements.define("friend-card", Friend);
