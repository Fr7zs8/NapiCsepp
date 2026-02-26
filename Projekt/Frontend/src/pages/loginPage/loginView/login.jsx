import "./login.css";
import image1 from "../../../assets/image1.jpg";
import {Mail, Lock} from "lucide-react";
import AuthCard from "../../../components/Auth/AuthCard";
import { LoginRegisterSwitch } from "../login-register-switch/login-register-switch";
import { useNavigate } from 'react-router-dom'
import { clientService } from "../../../router/apiRouter";
import { useState } from "react";


export function LoginView(){
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await clientService.login(email, password);
            navigate("/profile"); 
        } catch (err) {
            setError(err.message || "Hibás email vagy jelszó!");
        } finally {
            setLoading(false);
        }
    };

    return(
        <section className="login-page-shell">
            <div className='login-conatiner'>
                <div className="login-image-div">
                    <img src={image1} alt="Login kép"/>
                </div>
                <div className='login-content-div'>
                    <AuthCard>
                            <div className="login-header-div">
                                <h1>Üdvözülünk a NapiCsepp Weboldalán!</h1>
                                <h3>DailyDrop - A tökéletes szokáskövető mindennapi használatra!</h3>
                            </div>

                            <form onSubmit={handleLogin}>
                               <div className="login-form-div">
                                    <LoginRegisterSwitch currentPage="login"/>
                                    <label className="switchlabel">Jelentkezz be a fiókodba</label>

                                    {error && <div className="error-message">{error}</div>}
                                </div>

                                <div className="login-form-input-div">
                                    <div className="input-label-row">
                                        <Mail size={20}/>
                                        <label>Email</label>
                                    </div>
                                    <input type="email" 
                                        placeholder="pelda@email.hu"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="login-form-input-div">
                                    <div className="input-label-row">
                                        <Lock size={20}/>
                                        <label>Jelszó</label>
                                    </div>
                                    <input type="password" 
                                        placeholder="Jelszó"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <div className="login-button-div">
                                    <button type="submit" disabled={loading}>{loading?"Belépés...":"Belépés"}</button>
                                </div> 
                            </form>
                            
                            <div className="form-footer">
                                <label>Még nincs fiókod? <a onClick={() => navigate("/register")}>Regisztráció</a></label>
                            </div>
                    </AuthCard>
                </div>
                
            </div>
        </section>
    )
}