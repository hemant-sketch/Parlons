const server_url = "http://localhost:8000";
import styles from "../styles/videoComponent.module.css";
import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
//import server from '../environment';


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
    let [message, setMessage] = useState(""); //humne jo msg likha
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
                // woh media jo humare cam aur mic se aari usko userMediaStream mein dal to share
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable});
                if(userMediaStream) {
                    // local stream humare local (meri personal) hme dikhega
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

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())  //purani koi stream hai toh band krde
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoRef.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoRef.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination()) //ek constant tone milgei hume bs aur kuch nahi
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let getUserMedia = () => {
        if((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({video: video, audio: audio})   //getUserMedia api to get camrea ans mic     
            .then((getUserMediaSuccess))
            .then((stream)=> { })
            .catch((e)=> console.log(e)) 
        }else{
            try{
                let tracks = localVideoRef.current.srcObject.getTracks(); //localVideoRef is vid element and srcObjec is the currently playign 
                // getTracks returns arary of all media tracks
                // each track represents audio or video
                tracks.forEach(track => track.stop()); //stop manje webcam aur mic band krde
            }catch(err){
                console.log(err);
            }
        }
    }

    useEffect(()=> {
      getPermissions();  
    },[])

    useEffect(()=> {  //mute unmute aur video wagera dikahana check krne ko
        if(video != undefined && audio != undefined) {
            getUserMedia();
        }
    },[audio, video]);  //kabhi mute and cam band kiya isiliye


    let gotMessageFromServer = (fromId, message) => {   //fromid sender ki socket id
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) { //Session Description Protocol, exeything aboput the signal like what type of conenctoin, supoorted codecx, netwrok dtat, ans hai ki offer hai
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let addMessage =() => {

    }

    let connectToSocketServer = () => {  //to connect the user to the socket server

        //useREf cuurent is where actual value is stored
        // io.cooenct to socket.io server secure false mtlb https nahi chaiye
        socketRef.current = io.connect(server_url, { secure: false })  // this line creates live connection bw browers and the server

        // on is socketio syntax to listen to events, signal is name of the event that server sends
        //signal acries ice candidates or sdp info
        //that when two browsers or applications want to establish a real-time communication link using WebRTC, 
            //they need to exchange certain critical metadata, and this exchange process is 
            //referred to as signaling. The actual data exchanged during this signaling process is 
            //primarily the ICE candidates and Session Description Protocol (SDP) information.
        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {   //jab connection ban jaega tab yeh function chlega
            socketRef.current.emit('join-call', window.location.href) //emit sends event to server  //jitne bhi same url par age woh same call mein join honge
            socketIdRef.current = socketRef.current.id //har connection ki unqiue id hogi aur hume milri idhr se

            socketRef.current.on('chat-message', addMessage) //listening to chatmesage jab bhi event trigger hua yeh add message fucntoin ko triger krdo

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })//jab bhi koi leave kiya 

            socketRef.current.on('user-joined', (id, clients) => {  //id of theuser who joined and clients baaki saare jo room mein hai unkiu socket id
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerCongfigConnections) //this creates webRTC peerconnection to this user andpeercondifCOnnectio is the stun server
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {  //dno ke beechme connection banane ke liye use hora
                        if (event.candidate != null) { //upar wala kaafi baar ssearch krega par aakhir mien agar kuch nhi mila toh neche wala krde
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {  //on add stream tab trigger hoga jab saamne wale apni video string  bhejeneg
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        // vedioREf is the array of all video obkejct in the ui
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)  //ad stream to peer coneection
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])  //black() and silence() are fucntions
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {  //jisne yeh event trigger kiya agr woh main hu toh yeh warna woh
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)  //add local stream to each connection
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => { //create offer connection proposal
                            connections[id2].setLocalDescription(description) // save my current local configuration
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription })) //Hey server, send my SDP offer to this user with socket ID id2.
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let getMedia =() => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }
    
    return (
        <div>

            {askForUsername === true ?

                <div>


                    <h2>Enter into Lobby </h2>
                    <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                    <Button variant="contained" onClick={connect}>Connect</Button>


                    <div>
                        <video ref={localVideoRef} autoPlay muted></video>
                    </div>

                </div> : 
                <>
                    <video ref={localVideoRef} autoPlay muted></video>
                    
                    {videos.map((video)=>(
                        <div key={video.socketId}>

                        </div>
                    ))}
                
                
                
                </>


            }    
        </div>
    )
}