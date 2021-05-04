import React, {Component} from 'react'
import axios from 'axios'
import Config from '../config.json'
import Cookies from 'js-cookie'
import {formatTime} from '../Utils'
import {withRouter} from 'react-router-dom'

import './PackProgressRing.scss'

class PackProgressRing extends Component {
    constructor(props) {
        super();
        this.props = props;
        this.radius = 46;
        this.strokeDashes = this.radius * 2 * Math.PI;
        this.update = 50;
        this.packTime = 0;
        this.packTimeMax = 100;

        this.lcounter = 0;
        this.lcounterMax = 2;

        this.state =
        {
            progress: this.strokeDashes,
            text: 'Pack'
        }
    }

    loadMaxPackTime(self) {
        axios.get(`${Config.API_HOST}/packTimeMax`)
            .then((res) => {
                if (res && res.status === 200) {
                    if (res && res.data && res.data.status === 0) {
                        self.packTimeMax = res.data.packTimeMax;
                        this.incrementLCounter();
                    }
                }
            })
    }

    loadPackTime(self) {
        axios.post(`${Config.API_HOST}/packtime`, {token: Cookies.get('token')})
            .then((res) => {
                if (res && res.status === 200) {
                    if (res && res.data && res.data.status === 0) {
                        self.packTime = res.data.packTime;
                        this.incrementLCounter();
                    }
                }
            })
    }

    incrementLCounter() {
        this.lcounter++;
        if (this.lcounter === this.lcounterMax && this.props.lCallback) this.props.lCallback();
    }

    componentDidMount() {
        this.loadMaxPackTime(this);
        this.loadPackTime(this);

        this.interval = setInterval(() => {
            this.packTime -= this.update;
            if (this.packTime < 0) this.packTime = 0;

            const progress = this.packTime / this.packTimeMax * this.strokeDashes;

            let text = 'Open';
            if (this.packTime !== 0) text = formatTime(this.packTime)

            this.setState({progress: progress, text: text});
        }, this.update);

        window.addEventListener("focus", () => {this.loadPackTime(this)});
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    onClick(obj) {
        if (obj.packTime === 0)
            this.props.history.push('/pack');
    }

    render() {
        return (
            <svg className={`packProgressRing ${this.props.className}`} viewBox="0 0 100 100">
                <text fontSize={this.radius / 3} x="50%" y="50%" textAnchor="middle" fill="#fff" dy=".38em">{this.state.text}</text>
                <circle
                    onClick={() => {this.onClick(this)}}
                    stroke="white"
                    strokeDasharray={this.strokeDashes}
                    strokeDashoffset={this.state.progress}
                    strokeWidth="2"
                    fill="transparent"
                    r={this.radius}
                    cx="50"
                    cy="50"

                    transform="rotate(-90, 50, 50)"

                />
            </svg>
        )
    }
}

export default withRouter(PackProgressRing)
