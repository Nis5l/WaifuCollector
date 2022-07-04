import {Component} from 'react'
import CollapsibleContent from 'react-collapsible-content'
import ResizeText from './ResizeText'

import "./Foldable.scss"
import "../scss/effects.scss"

type Props = {
    styleClassName: string,
    title: string,
    children: any
}

type State = {
    expanded: boolean
}

class Foldable extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            expanded: false
        }
    }

    onOpen() {
        this.setState({expanded: !this.state.expanded});
    }

    render() {
        return (
            <div onClick={() => {this.onOpen()}} className={`card fold-card ${this.props.styleClassName}`}>

                <div className="card-title"><ResizeText center={false} maxSize={0}><h1 className="shake-small">{this.props.title}</h1></ResizeText></div>

                <CollapsibleContent expanded={this.state.expanded} className="card-content">

                    {this.props.children}

                </CollapsibleContent>

            </div >
        );
    }
}

export default Foldable;
