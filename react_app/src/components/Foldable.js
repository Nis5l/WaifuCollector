import React, {Component} from 'react';
import CollapsibleContent from 'react-collapsible-content';

import "./Foldable.scss"
import "../scss/effects.scss"

class Foldable extends Component {
    constructor(props) {
        super();
        this.props = props;
        this.state = {
            expanded: false
        }
    }

    onopen() {
        this.setState({expanded: !this.state.expanded});
    }

    render() {
        return (
            <div onClick={() => {this.onopen()}} className={`card fold-card ${this.props.styleClassName}`}>

                <h1 className="card-title shake-small">{this.props.title}</h1>

                <CollapsibleContent expanded={this.state.expanded} className="card-content">

                    {this.props.children}

                </CollapsibleContent>

            </div >
        );
    }
}

export default Foldable;
