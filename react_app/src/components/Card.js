import React from 'react'

import "./Card.scss"

function Card(props) {
    var content;

    content = <div className="card-content-fill">
        <div className="card-content">
            {props.children}
        </div>
    </div>

    if (props.full) {
        content = <div className="card-content-fill">
            {props.children}
        </div>
    }
    return (
        <div className={`card ${props.styleClassName}`}>

            <h1 className="card-title">{props.title}</h1>
            {content}
        </div>
    )
}

export default Card
