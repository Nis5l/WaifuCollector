import React, {useState, useEffect} from 'react'

import './PackProgressRing.scss'

function PackProgressRing(props) {

    const [progress, setProgress] = useState(315);

    const radius = 46;

    useEffect(() => {

        let running = true;

        progress > 0 && setTimeout(() =>{

            if(!running)
                return;

            setProgress(progress - 1)
        
        }, 1000);

        return function cleanup(){

            running = false;

        }


    }, [progress]);

    return (
            <svg className={`packProgressRing ${props.className}`} viewBox="0 0 100 100">
                <text fontSize={radius/3} x="50%" y="50%" textAnchor="middle" fill="#fff" dy=".38em">123</text>
                <circle
                    stroke="white"
                    strokeDasharray="315"
                    strokeDashoffset={progress}
                    strokeWidth="2"
                    fill="transparent"
                    r={radius}
                    cx="50"
                    cy="50"

                    transform="rotate(-90, 50, 50)"

                />
            </svg>
    )
}

export default PackProgressRing
