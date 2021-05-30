import React from 'react'
import Card from '../../components/Card'
import Foldable from "../../components/Foldable"

import "./Privacy.scss"

function Privacy() {
    
    return (

        <Card
            title="Privacy Policy"
            styleClassName="privacy_content"
        >
            
            <Foldable
                title="Data collection and usage"    
            >
                <p>
                    We collect store and process the username, password and email you enter at the register page when creating an account.<br/>
                    <br/>
                    The email is used to verify the account, you will only recieve absolutely necessary mails.<br/>
                    We require an email to hinder people from creating too many accounts.<br/>
                    <br/>
                    The other information is used to store account bound gameplay data, which is necessary for the game to function e.g. collected cards and friends.<br/>
                    <br/>
                    Sensitive information like the email password is kept in the system and not shared or sold to others.<br/>
                    Other information like the username or the collected gameplay data may be shared with other users.<br/>
                    <br/>
                    The Information is kept in the system until no longer necessary, but can be removed on user demand.<br/>
                    <br/>
                    Our servers are located in Italy, so be aware that your data may be transferred, stored and processed in Italy.<br/>
				</p>
                
            </Foldable>

            <Foldable
                title="Cookies"    
            >
                <p>
                    The only cookies we collect use and store are ours.<br/>
                    In them we store a token which will automatically log you into your account.<br/>
                    Because of that the cookies should not be shared with others.<br/>
                </p>
            </Foldable>

            <Foldable
                title="Age"    
            >
                <p>
                    We do not knowingly collect data from children under 13 years of age.<br/>
					By using this site you confirm that you are older than 13 years of age.<br/>
                </p>
            </Foldable>

            <Foldable
                title="Updates"    
            >
                <p>
                    The privacy policy may be changed in the future to stay compliant with laws and inform you in case any other data will be processed in the future.<br/>
				    Therefore we recommend you to review this privacy policy frequently<br/>
                </p>
            </Foldable>

            <Foldable
                title="Your Privacy Rights"    
            >
                <p>
                    In case you want to review, change, or delete your data stored and processed by us you can contact us.<br/>
                </p>   
            </Foldable>

            <Foldable
                title="Contact"    
            >
                <p>
                    Email: contact.waifucollector@gmail.com<br/>
					Discord-Server: <a href="https://discord.gg/hftNUqNgRj" target="_blank">https://discord.gg/hftNUqNgRj</a><br/>
					WaifuCollector<br/>
					Hollechn 5<br/>
					39030 St.Peter<br/>
					Italy<br/>
                </p>   
            </Foldable>

        </Card>

    )

}

export default Privacy
