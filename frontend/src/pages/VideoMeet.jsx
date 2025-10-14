const server_url = "http://localhost:8000";
import {useState, useEffect} from 'react';
import "../styles/videoComponent.css";



var connections = {};
const peerCongfigConnections = {
    "iceServers" : [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();  //mera socketid
    let localVideoRef = useRef(); //humara video idhr dikhega aur baaki video ka arary define krdenege
    let [videoAvailable, setVideoAvailable] = useState(true);   //yeh ki huamre paas hardware wise persmission hai ki nahi hai
    let [audioAvailable, setAudioAvailable] = useState(true);   //yeh ki huamre paas hardware wise persmission hai ki nahi hai
    let [video, setVideo] = useState();  //video on off ki dikhana shakal
    let [audio, setAudio] = useState();  //audio on off ki dikhana shakal
    let [screen, setScreen] = useState(); //screen dikhara?
    let [showModal, setShowModal] = useState();  //pop ups
    let [screenAvailable, setScreenAvailable] = useState();  //scren share avalbe hai ya nahi hai
    let [messages, setMessages] = useState([]); //hume jo msg aare
    let [message, setMessage] = useState(""); //humne jo msg likhe
    let [newMessages, setNewMessages] = useState(0); //title wala msgs
    let [askForUsername, setAskForUsername] = useState(true); //guest
    let [usersername, setUsername] = useState(""); 
    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);

    // if(isChrome() === false){

    // }
    
    return (
        <div>
            {askForUsername === true ? 
               <div>

               </div> :
               <div>

                </div>
            }
        </div>
    )
}