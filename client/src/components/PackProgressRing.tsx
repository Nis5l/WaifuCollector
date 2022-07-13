import {Component} from 'react'
import {formatTime} from '../Utils'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import moment, { Duration, Moment } from 'moment';

import './PackProgressRing.scss'
import redirectIfNecessary from './Redirecter'
import { AxiosPrivateProps, withAxiosPrivate } from '../hooks/useAxiosPrivate'

type PropsPackProgressRing = RouteComponentProps & AxiosPrivateProps & {
    collectorID: string,
    className: string,
    lCallback: () => void,
    history: any
}

type StatePackProgressRing = {
    progress: number,
    text: string
}

class PackProgressRing extends Component<PropsPackProgressRing, StatePackProgressRing> {
    public radius: number;
    public strokeDashes: number;
    public update: number;
    public packTime: Moment | undefined;
    public packTimeMax: Duration;

    public lcounter: number;
    public lcounterMax: number;

    public interval: NodeJS.Timer | undefined;

    constructor(props: PropsPackProgressRing) {
        super(props);
        this.radius = 46;
        this.strokeDashes = this.radius * 2 * Math.PI;
        this.update = 50;
        this.packTime = undefined;
        this.packTimeMax = moment.duration(100);

        this.lcounter = 0;
        this.lcounterMax = 2;

        this.state =
        {
            progress: this.strokeDashes,
            text: 'Pack'
        }
    }

    loadMaxPackTime(self: PackProgressRing) {
        this.props.axios.get(`${this.props.collectorID}/pack/time/max`)
            .then((res: any) => {
				self.packTimeMax = moment.duration(res.data.packTimeMax);
				this.incrementLCounter();
            }).catch((err: any) => {
				console.log("Unexpected /pack/time/max error");
			});
    }

    loadPackTime(self: PackProgressRing) {
        this.props.axios.get(`/pack/${this.props.collectorID}/time`)
			.then((res: any) => {
				self.packTime = moment(res.data.packTime);
				this.incrementLCounter();
            }).catch((err: any) => {
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

			let diff = this.packTime.diff(now);
			if(diff < 0) diff = 0;

			const progress = diff / this.packTimeMax.asMilliseconds() * this.strokeDashes;

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

    onClick(obj: any) {
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

export default withAxiosPrivate(withRouter(PackProgressRing));
