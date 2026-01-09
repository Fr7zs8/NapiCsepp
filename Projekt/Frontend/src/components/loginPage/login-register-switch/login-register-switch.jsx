import './login-register.css'
import { useNavigate } from 'react-router-dom'

export function LoginRegisterSwitch({currentPage}){
    const navigate = useNavigate();
    
    return(
        <div className="login-register-container">
            <div className="login-register-border">
                <div className="login-register-switch">
                    <input type="radio" id="lr-switch1" name="lr" checked={currentPage === 'login'}
                        onChange={() => {}}/>
                    <label htmlFor="lr-switch1" onClick={()=>navigate("/login") }>Belépés</label>

                    <input type="radio" id="lr-switch2" name="lr" checked={currentPage === 'register'}
                        onChange={() => {}}/>
                    <label htmlFor="lr-switch2" onClick={()=>navigate("/register") }>Regisztráció</label>

                    <span className="lr-active-label"></span>
                </div>
            </div>
        </div>
    )
}
