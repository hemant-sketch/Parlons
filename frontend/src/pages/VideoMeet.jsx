const server_url = "http://localhost:8000";
import {useState, useEffect} from 'react';
import "../styles/videoComponent.css";
import { useRef } from 'react';
import { TextField, Button } from '@mui/material';


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
    let [username, setUsername] = useState(""); 
    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);
    

    // if(isChrome() === false){

    // }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({video: true})  //camera permission
            if(videoPermission) {
                setVideoAvailable(true);
            }else{
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio: true})  //camera permission
            if(audioPermission) {
                setAudioAvailable(true);
            }else{
                setAudioAvailable(false);
            }

            if(navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            }else{
                setScreenAvailable(false);
            }

            if(videoAvailable || audioAvailable) {
                // woh media jo hum idhra udhr bhejenge
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable});
                if(userMediaStream) {
                    // local stream humare cam ka
                    window.localStream = userMediaStream;
                    if(localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        }catch(err) {
            console.log(err);
        }
    }

    useEffect(()=> {
      getPermissions();  
    },[])
    
    return (
        <div>
            {askForUsername === true ? 
               <div>
                    <h2>Enter into Lobby</h2>
                    <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} />
                    <Button variant="contained">Connect</Button>
                    <div>
                        <video ref={localVideoRef} autoPlay muted></video>
                    </div>


               </div> :
               <div>

                </div>
            }
        </div>
    )
}