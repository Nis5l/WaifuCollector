import { useState } from "react";
import Card from "../../../components/Card";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

import "./CollectorNew.scss";

function CollectorNewComponent(){
    const [ disabled, setDisabled ] = useState(true);
    const [ name, setName ] = useState("");
    const axios = useAxiosPrivate();

    const onClick = () => {
        setDisabled(true);
        axios.post("/collector/create", { name }).then((res: any) => {
            const collectorID: string = res.data.id;
            console.log(collectorID);
        });
    }

    return (
        <Card
            title="Create Collector"
            styleClassName="create-collector-card"
        >
            <div className="create-collector-card-content">
                <input
                    type="text"
                    autoComplete="false"
                    className="text_input"
                    name="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        const newDisabled = e.target.value.length <= 5;
                        if(newDisabled !== disabled){
                            setDisabled(newDisabled);
                        }
                    }}
                />
                <input className="button_input" type="submit" name="submit" value="Create" onClick={onClick} disabled={disabled} />
            </div>
        </Card>
    )
}

export default CollectorNewComponent;