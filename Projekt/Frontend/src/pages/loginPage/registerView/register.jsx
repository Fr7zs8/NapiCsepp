import "./register.css";
import image4 from "../../../assets/image4.jpg";
import {Lock, CircleUser, UserRound} from "lucide-react";
import { LoginRegisterSwitch } from "../../../components/login-register-switch/login-register-switch"
import AuthCard from "../../../components/Auth/AuthCard";
import PasswordInput from "../../../components/PasswordInput/PasswordInput";
import { useNavigate } from 'react-router-dom'
import { clientService } from "../../../router/apiRouter";
import { useState } from "react";

export function RegisterView(){
    const navigate = useNavigate();

    const [ username, setUsername] = useState("");
    const [ email, setEmail] = useState("");
    const [ password, setPassword] = useState("");
    const [ confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        if (password !== confirmPassword) {
            setError("A jelszavak nem egyeznek!");
            return;
        }
        
        if (password.length < 5) {
            setError("A jelszónak legalább 5 karakter hosszúnak kell lennie!");
            return;
        }


        try {
            const currentDay = new Date().toISOString().split("T")[0];
            await clientService.register(username, email, password, "hu", "user", currentDay);
            await clientService.login(email, password);
            navigate("/");
        } catch (err) {
            console.error("Regisztrációs hiba:", err);
            setError("Sikertelen regisztráció. Kérem próbálja újra!");
        } finally {
            setLoading(false);
        }
    };



    return(
        <section className="register-page-shell">
            <div className='register-conatiner'>
                <div className="register-image-div">
                    <img src={image4} alt=""/>
                </div>
                <div className='register-content-div'>
                    <AuthCard>
                            <div className="register-header-div">
                                <h1>Üdvözülünk a NapiCsepp Weboldalán!</h1>
                                <h3>DailyDrop - A tökéletes szokáskövető mindennapi használatra!</h3>
                            </div>

                            <form onSubmit={handleRegister}>
                                <div className="register-form-div">
                                    <LoginRegisterSwitch currentPage="register"/>
                                    <label className="switchlabel">Hozz létre új fiókot</label>

                                    {error && <div className="error-message">{error}</div>}
                                </div>

                                <div className="register-form-input-div">
                                    <div className="input-label-row"> 
                                        <CircleUser size={20}/>
                                        <label>Felhasználó név</label>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="KovacsJanos"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>

                                <div className="register-form-input-div">
                                    <div className="input-label-row">
                                        <UserRound size={20}/>
                                        <label>Email</label>
                                    </div>
                                    <input 
                                        type="email" 
                                        placeholder="pelda@gmail.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="register-form-input-div">
                                    <div className="input-label-row">
                                        <Lock size={20}/>
                                        <label>Jelszó</label>
                                    </div>
                                    <PasswordInput
                                        placeholder="Jelszó"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                <div className="register-form-input-div">
                                    <div className="input-label-row">
                                        <Lock size={20}/>
                                        <label>Jelszó megerősítése</label>
                                    </div>
                                    <PasswordInput
                                        placeholder="Jelszó újra"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>

                                <div className="register-button-div">
                                    <button type="submit" disabled={loading}>{loading?"Regisztráció...":"Regisztráció"}</button>
                                </div>
                            </form>

                            <div className="form-footer">
                                <label>Van fiókod? <a onClick={() => navigate("/login")}>Belépés</a></label>
                            </div>
                    </AuthCard>
                </div>
                
            </div>
        </section>
    )
}