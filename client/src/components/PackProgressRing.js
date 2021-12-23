import React, {Component} from 'react'
import axios from 'axios'
import Config from '../config.json'
import Cookies from 'js-cookie'
import {formatTime} from '../Utils'
import {withRouter} from 'react-router-dom'
import moment from 'moment';

import './PackProgressRing.scss'
import redirectIfNecessary from './Redirecter'

class PackProgressRing extends Component {
    constructor(props) {
        super();
        this.props = props;
        this.radius = 46;
        this.strokeDashes = this.radius * 2 * Math.PI;
        this.update = 50;
        this.packTime = undefined;
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
        axios.get(`${Config.API_HOST}/pack/time/max`)
            .then(res => {
				self.packTimeMax = moment.duration(res.data.packTimeMax);
				this.incrementLCounter();
            }).catch(err => {
				console.log("Unexpected /pack/time/max error");
			});
    }

    loadPackTime(self) {
        const data =
        {
			headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
        }

        axios.get(`${Config.API_HOST}/pack/time`, data)
			.then(res => {
				self.packTime = moment(res.data.packTime);
				this.incrementLCounter();
            }).catch(err => {
                redirectIfNecessary(this.props.history, err);
			});
    }

    incrementLCounter() {
        this.lcounter++;
        if (this.lcounter === this.lcounterMax && this.props.lCallback) this.props.lCallback();
    }

    componentDidMount() {
        this.loadMaxPackTime(this);
        this.loadPackTime(this);

        this.interval = setInterval(() => {
			if(this.packTime == null) return;
			let now = new Date();

			let diff = this.packTime - now;
			if(diff < 0) diff = 0;

			const progress = diff / this.packTimeMax * this.strokeDashes;

            let text = 'Open';
			if(diff > 0)
				text = formatTime(diff.toString());

            this.setState({progress, text});
        }, this.update);

        window.addEventListener("focus", () => {this.loadPackTime(this)});
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    onClick(obj) {
        if (new Date() >= obj.packTime)
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
