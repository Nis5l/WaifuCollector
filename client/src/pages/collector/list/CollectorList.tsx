import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import CollectorComponent from "../../../components/collector/Collector";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import Collector from "../../../shared/Collector";

import "./CollectorList.scss";

type PropsCollectorList = {}

function CollectorList(props: PropsCollectorList){
    const axiosPrivate = useAxiosPrivate();
    const [ collectors, setCollectors ] = useState<Collector[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        axiosPrivate.get("/collector/list").then((response: any) => {
            const list: Collector[] = response.data;
            setCollectors(list);
        });
    }, [ setCollectors ]);

    const onClick = (collector: Collector) => {
        navigate(`/collector/${collector.id}/dashboard`);
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

export default CollectorList;