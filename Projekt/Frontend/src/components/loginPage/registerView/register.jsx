import "./register.css";
import image4 from "../../../assets/image4.jpg";
import {Mail, Lock, CircleUser, UserRound} from "lucide-react";
import { LoginRegisterSwitch } from "../login-register-switch/login-register-switch";


export function RegisterView(){
    return(
        <section className="register-section">
            <div className='register-conatiner'>
                <div className="register-image-div">
                    <img src={image4} alt=""/>
                </div>
                <div className='register-content-div'>
                    <div className="register-header-div">
                        <h1>Üdvözülünk a NapiCsepp Weboldalán!</h1>
                        <h3>DailyDrop - A tökéletes szokáskövető mindennapi használatra!</h3>
                    </div>
                    <div className="register-form-div">
                        <LoginRegisterSwitch/>
                        <label>Hozz létre új fiókot</label>
                    </div>
                    <div className="register-form-input-div">
                        <div className="input-label-row"> 
                            <CircleUser size={20}/>
                            <label>Felhasználó név</label> <br />
                        </div>
                        <input type="text" placeholder="KovacsJanos"/>
                    </div>
                    <div className="register-form-input-div">
                        <div className="input-label-row">
                            <UserRound size={20}/>
                            <label>Email</label> <br />
                        </div>
                        <input type="text" placeholder="pelda@gmail.com"/>
                    </div>
                    <div className="register-form-input-div">
                        <div className="input-label-row">
                            <Lock size={20}/>
                            <label>Jelszó</label> <br />
                        </div>
                        <input type="password" placeholder="Jelszó"/>
                    </div>
                    <div className="register-form-input-div">
                        <div className="input-label-row">
                            <Lock size={20}/>
                            <label>Jelszó megerősítése</label> <br />
                        </div>
                        <input type="password" placeholder="Jelszó újra"/>
                    </div>
                    <div className="register-button-div">
                        <button>Belépés</button>
                        <button>Vendég Mód</button>
                    </div>
                    <div>
                        <label>Van fiókod? <a href="#login">Belépés</a></label>
                    </div>
                </div>
                
            </div>
        </section>
    )
}