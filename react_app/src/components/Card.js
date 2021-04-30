import React from 'react'
import ResizeText from './ResizeText'

import "./Card.scss"

function Card(props) {

    return (

        <div className={"card " + props.styleClassName}>

            { props.title && <div className="card-title"><ResizeText><h1>{props.title}</h1></ResizeText></div>}

            <div className="card-content" style={{height: !props.title ? "100%" : ""}}>

                {props.children}

            </div>

        </div>

    );

}

export default Card
