import React, {Component} from 'react'
import Chart from 'chart.js'

import "./PackGraph.scss"
import axios from 'axios'
import Config from '../config.json'


const config = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Packs Opened',
            lineTension: 0,
            backgroundColor: '#fffff',
            borderColor: '#fffff050',
            data: [],
            fill: false,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                }
            }]
        }
    }
};

const refreshTime = 1000 * 60;

class PackGraph extends Component {

    constructor(props) {

        super(props);

        this.ctx = React.createRef();
        this.chart = undefined;

    }

    componentDidMount() {

        this.loadGraph();
        this.updateChart();

        this.interval = setInterval(() => this.updateChart(), refreshTime);
    }

    componentWillUnmount() {

        clearInterval(this.interval);

    }

    async loadGraph() {

        this.chart = new Chart(this.ctx.current, config);

    }

    async loadData() {

        try {
            const res = await axios.get(`${Config.API_HOST}/pack/data`);

			return res.data;

        } catch (ex) {
            console.log("Unexpected /pack/data error");
        }

        return [];

    }

    async updateChart() {

        const options = {hourCycle: "h23", weekday: 'short', hour: 'numeric', minute: '2-digit'};

        const packData = await this.loadData();

        if (this.props.onLoad) this.props.onLoad();

        this.chart.data.datasets[0].data = [];
        this.chart.data.labels = [];

        for (let i = 0; i < packData.length; i++) {

            let date = new Date(packData[i].time);
            let timeString = date.toLocaleDateString("en-US", options);

            this.chart.data.labels.push(timeString);
            this.chart.data.datasets[0].data.push(packData[i].amount);

        }

        this.chart.update();

    }

    render() {
        return (
            <div className={`graphContainer ${this.props.styleClassName}-container`}>
                <canvas ref={this.ctx} className={`graph ${this.props.styleClassName}`}></canvas>
            </div>
        )
    }
}

export default PackGraph;
