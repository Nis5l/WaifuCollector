class ProgressRing extends HTMLElement {
  constructor() {
    super();
    const stroke = this.getAttribute('stroke');
    const radius = this.getAttribute('radius');
    this.radius = radius;
    const normalizedRadius = radius - stroke * 2;
    this.time = this.getAttribute('time');
    this._circumference = normalizedRadius * 2 * Math.PI;

    this._root = this.attachShadow({mode: 'open'});
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
    const offset = this._circumference - (percent / 100 * this._circumference);
    const circle = this._root.querySelector('circle');
    if(percent == 100)
    {
      circle.style.fill ="rgba(214, 214, 214)";
      circle.style.fillOpacity = "0.06";
    }
    circle.style.strokeDashoffset = offset; 
  }

  setTime(time)
  {
    const text = this._root.querySelector('text');
    this.time = time;
    text.innerHTML = time;
  }

  static get observedAttributes() {
    return ['progress', 'time'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'progress') {
      this.setProgress(newValue);
    }
    if (name === 'time') {
      this.setTime(newValue);
    }
  }

  isClicked(x,y)
  {
    if(this.time != 0 && this.time != "Open")
      return;
    const circle = this._root.querySelector('circle');
    const circleX = circle.getBoundingClientRect().right - (circle.getBoundingClientRect().right - circle.getBoundingClientRect().left)  / 2;
    const circleY = circle.getBoundingClientRect().top - (circle.getBoundingClientRect().top - circle.getBoundingClientRect().bottom)  / 2;
    const ret = Math.sqrt((circleX-x)*(circleX-x) + (circleY-y)*(circleY-y)) < this.radius;
    if(ret)
      circle.style.fillOpacity = "0.5";
    if(ret)
    return ret;
  }

}

window.customElements.define('progress-ring', ProgressRing);