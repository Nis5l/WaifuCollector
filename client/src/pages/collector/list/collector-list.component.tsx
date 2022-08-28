import { useEffect, useState } from "react";

import CollectorComponent from "./collector";
import { useAxiosPrivate } from "../../../hooks";
import { Collector } from "../../../shared/types";

import "./collector-list.component.scss";

function CollectorListComponent(props: {}){
    const axiosPrivate = useAxiosPrivate();
    const [ collectors, setCollectors ] = useState<Collector[]>([]);

    useEffect(() => {
        axiosPrivate.get("/collector/list").then((response: any) => {
            const list: Collector[] = response.data;
            setCollectors(list);
        });
    }, [ setCollectors ]);

    const onClick = (collector: Collector) => {
        console.log(collector);
    }

    return (
        <div className="collector-list-content">
            {collectors.map(function(obj){
                return (
                    <CollectorComponent
                        key={obj.id}

                        collector={obj}
                        onClick={onClick}
                    />
                )
            })}
        </div>
    )
}

export default CollectorListComponent;
