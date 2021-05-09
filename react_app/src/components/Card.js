import React from 'react'
import ResizeText from './ResizeText'

import "./Card.scss"

function Card(props) {

    return (

        <div className={"card " + props.styleClassName}>

            {
                props.title &&
                <div
                    className="card-title"
                >
                    <ResizeText>
                        <h1>
                            {props.title}
                        </h1>
                    </ResizeText>
                    {
                        props.icon &&
                        <div className="icon">
                            <i onClick={props.onIconClick} className={"fas " + props.icon} />
                            {props.iconNum !== undefined && props.iconNum !== 0 && <div><p>{props.iconNum}</p></div>}
                        </div>
                    }
                </div>
            }

            <div className="card-content" style={{height: !props.title ? "100%" : ""}}>

                {props.children}

            </div>

        </div>

    );

}

export default Card
