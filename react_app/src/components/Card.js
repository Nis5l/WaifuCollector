import React from 'react'

import "./Card.scss"

function Card(props) {
    
    return (

        <div className={"card " + props.styleClassName }>

            { props.title && <h2 className="card-title">{props.title}</h2> }

            <div className="card-content">

                {props.children}

            </div>

        </div>

    );

}

export default Card
