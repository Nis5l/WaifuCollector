import React from 'react'

import "./Card.scss"

function Card(props) {
    
    return (

        <div className={"card " + props.styleClassName }>

            { props.title && <h1 className="card-title">{props.title}</h1> }

            <div className="card-content">

                {props.children}

            </div>

        </div>

    );

}

export default Card
