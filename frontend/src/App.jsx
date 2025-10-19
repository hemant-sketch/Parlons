import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landing.jsx";
import Authentication from "./pages/authentication.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import HomeComponent from "./pages/home.jsx";
import VideoMeetComponent from "./pages/VideoMeet.jsx";
import History from "./pages/history.jsx";

function App() {
  return (
    <>
      <Router>    
        <AuthProvider>   
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/home" element={<HomeComponent />} />
            <Route path="/history" element={<History />} />
            <Route path="/:url" element={<VideoMeetComponent/>}/>   
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;

//auth provide(useNavigate) ko Router ke andar hi use krna hota hai aur hum use navigate use kkre authprovider mein
