import React from 'react'

import "./PackGraph.scss"

function PackGraph(props) {
    return (
        <div className={`${props.styleClassNameWrapper}-container`}>
            <canvas className={`${props.styleClassNameWrapper}`}></canvas>
        </div>
    )
}

export default PackGraph
