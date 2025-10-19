import "../App.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {

    const router = useNavigate();
    
    return(
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>Parlons</h2>
                </div>
                <div className="navlist">
                    <p onClick={()=>{
                        //window.location.href = '/qwerty123'  why not done this
                        router("/qwerty123");
                    }}>Join as Guest</p>
                    <p onClick={()=>{
                        router("/auth");
                    }}>Register</p>
                    <div onClick={()=>{
                        router("/auth");
                    }} role="button"><p>Login</p></div>
                </div>
            </nav>

            
            <div className="landingMainContainer">
                <div>
                    <h1><span style={{color: "#FF9839"}}>Connect</span> with your loved Ones</h1>
                    <p>Cover a distance by Parlons</p>
                    <div role="button">
                        <Link to={"/auth"}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src="/public/mobile.png" alt="mobile images" className="mobile4"/>
                </div>


            </div>    


        </div>
    )
}