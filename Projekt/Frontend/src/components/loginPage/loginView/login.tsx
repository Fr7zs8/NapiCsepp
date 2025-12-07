import "./login.css";
import image1 from "../../../assets/image1.jpg";
import {Mail, Lock} from "lucide-react";
import { LoginRegisterSwitch } from "../login-register-switch/login-register-switch";


export function LoginView(){
    return(
        <section>
            <div className='login-conatiner'>
                <div className="login-image-div">
                    <img src={image1} alt=""/>
                </div>
                <div className='login-content-div'>
                    <div className="login-header-div">
                        <h1>Üdvözülünk a NapiCsepp Weboldalán!</h1>
                        <h3>DailyDrop - A tökéletes szokáskövető mindennapi használatra!</h3>
                    </div>
                    <div className="login-form-div">
                        <LoginRegisterSwitch/>
                    </div>
                </div>
                
            </div>
        </section>
    )
}