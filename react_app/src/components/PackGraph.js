import React, {Component} from 'react'
import Chart from 'chart.js'

import "./PackGraph.scss"

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

class PackGraph extends Component {
    constructor(props) {
        super();
        this.props = props;
        this.ctx = React.createRef();
        this.chart = undefined;
    }
    componentDidMount() {
        this.loadGraph();
    }

    async loadGraph() {
        console.log(this.ctx);
        this.chart = new Chart(this.ctx.current, config);
    }

    render() {
        return (
            <div className={`${this.props.styleClassName}-container`}>
                <canvas ref={this.ctx} className={`graph ${this.props.styleClassName}`}></canvas>
            </div>
        )
    }
}

export default PackGraph;
