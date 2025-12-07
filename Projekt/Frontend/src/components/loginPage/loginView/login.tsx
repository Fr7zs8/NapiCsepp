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
                        <label>Jelentkezz be a fiókodba</label>
                    </div>
                    <div className="login-form-input-div">
                        <div className="input-label-row">
                            <Mail size={20}/>
                            <label>Email vagy felhasználónév</label><br />
                        </div>
                        <input type="text" />
                    </div>
                    <div className="login-form-input-div">
                        <div className="input-label-row">
                            <Lock size={20}/>
                            <label>Jelszó</label><br />
                        </div>
                        <input type="text" />
                    </div>
                    <div className="login-button-div">
                        <button>Belépés</button>
                        <button>Vendég Mód</button>
                    </div>
                    <div>
                        <label>Még nincs fiókod? <a href="">Regisztáció</a></label>
                    </div>
                </div>
                
            </div>
        </section>
    )
}