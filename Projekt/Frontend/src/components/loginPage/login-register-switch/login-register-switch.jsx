import './login-register.css'

export function LoginRegisterSwitch(){
    return(
        <div className="login-register-container">
            <div className="login-register-border">
                <div className="login-register-switch">
                    <input type="radio" id="lr-switch1" name="lr" defaultChecked/>
                    <label htmlFor="lr-switch1">Belépés</label>

                    <input type="radio" id="lr-switch2" name="lr"/>
                    <label htmlFor="lr-switch2">Regisztráció</label>

                    <span className="lr-active-label"></span>
                </div>
            </div>
        </div>
    )
}
