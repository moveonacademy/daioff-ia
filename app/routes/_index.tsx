// Chatbot.tsx
import { useFetcher } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { useEventSource } from "remix-utils/sse/react";
import DID_API from './api.json' 

export default function Chatbot() {

  let peerConnection:any;
  let sessionClientAnswer:any;
  
  let statsIntervalId:any;
  let videoIsPlaying:any;
  let lastBytesReceived:any;
  
  let talkVideo:any;

  let iceGatheringStatusLabel:any;
  let signalingStatusLabel:any;
  let connectButton:any;
  let talkButton:any;
  let peerStatusLabel:any;

  
let streamId=''
let sessionId=''

  const [connected,setConnected]=useState(false)
  const [iniciando,setIniciando]=useState(false)
  const [isLoading, setLoading] = useState(false);
  const [newfileId,setFileID]=useState("")
  const [newStreamId,setNewStream]=useState("")
  const [newSessionId,setNewSessionId]=useState("")

  const [history, setHistory] = useState([
    { role: 'assistant', content: 'Bienvenido al asistente legal laboral de España.' }
  ]);
  const [userInput, setUserInput] = useState('');
  const fetcher = useFetcher();

  // Escuchar eventos en tiempo real desde la API de suscripción
  const liveResponse = useEventSource("/api/subscribe", {
    event: "new-message"
  });

  function stopAllStreams() {
    if (talkVideo&&talkVideo.srcObject) {
      talkVideo.srcObject.getTracks().forEach((track:any) => track.stop());
      talkVideo.srcObject = null;
    }
  }
  
  function closePC(pc = peerConnection) {
    if (!pc) return;
    pc.close();
    pc.removeEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
    pc.removeEventListener('icecandidate', onIceCandidate, true);
    pc.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
    pc.removeEventListener('connectionstatechange', onConnectionStateChange, true);
    pc.removeEventListener('signalingstatechange', onSignalingStateChange, true);
    pc.removeEventListener('track', onTrack, true);
    clearInterval(statsIntervalId);
    console.log('stopped peer connection');
    if (pc === peerConnection) {
      peerConnection = null;
    }
  }
  
  function onIceGatheringStateChange() {
    iceGatheringStatusLabel.className = 'iceGatheringState-' + peerConnection.iceGatheringState;
  }
  function onIceCandidate(event:any) {
    console.log('onIceCandidate', event);
    if (event.candidate) {
      const { candidate, sdpMid, sdpMLineIndex } = event.candidate;

      fetchWithRetries(`${DID_API.url}/talks/streams/${streamId}/ice`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${DID_API.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate,
          sdpMid,
          sdpMLineIndex,
          session_id: sessionId,
        }),
      });
    }
  }
  function setVideoElement(stream: any) {
    if (!stream) return;
    const videoElement = document.getElementById('talk-video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.srcObject = stream;
      videoElement.loop = false;
      videoElement.muted = false;  // Mute the video to allow autoplay without interaction
      videoElement.play().catch(e => {
        console.error('Error auto-playing video:', e);
        // Provide a UI element or notification to the user to manually start the video
      });
    }
  }
  function playIdleVideo() {
    const videoElement = document.getElementById('talk-video') as HTMLVideoElement;
    if (videoElement) {
        videoElement.srcObject = null;
        videoElement.src = 'https://res.cloudinary.com/dug5cohaj/video/upload/v1715359344/uuhctl9z96dea222j08b.mp4';
        videoElement.loop = true;
        videoElement.muted = true;  // Asegurarte de que el video esté silenciado
        videoElement.play().catch(e => {
            console.error('Error playing idle video:', e);
            // Solicitar interacción del usuario para reproducir el video
        });
    }
}
  function onIceConnectionStateChange() {
    if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'closed') {
      stopAllStreams();
      closePC();
    }
  }
  function onConnectionStateChange() {
    // not supported in firefox
  }
  function onSignalingStateChange() {
  }
  
  function onVideoStatusChange(videoIsPlaying:any, stream:any) {
    let status;
    if (videoIsPlaying) {
      status = 'streaming';
      console.log("streaming")
      const remoteStream = stream;
      setVideoElement(remoteStream);
    } else {
      status = 'empty';
      playIdleVideo();
    }
  }
  function onTrack(event: any) {
  if (!event.track) return;

  statsIntervalId = setInterval(async () => {
    const stats = await peerConnection.getStats(event.track);
    let videoIsPlayingUpdated = false;
    stats.forEach((report: any) => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        if (videoIsPlaying !== (report.bytesReceived > lastBytesReceived)) {
          videoIsPlaying = report.bytesReceived > lastBytesReceived;
          videoIsPlayingUpdated = true;
        }
        lastBytesReceived = report.bytesReceived;
      }
    });
    if (videoIsPlayingUpdated) {
      onVideoStatusChange(videoIsPlaying, event.streams[0]);
    }
  }, 500);
}
  async function createPeerConnection(offer:any, iceServers:any) {
    
    if (!peerConnection) {
      const RTCPeerConnection :any= (
        window.RTCPeerConnection ||
        window.RTCPeerConnection
      ).bind(window);
      
      peerConnection = new RTCPeerConnection({ iceServers });
      peerConnection.addEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
      peerConnection.addEventListener('icecandidate', onIceCandidate, true);
      peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
      peerConnection.addEventListener('connectionstatechange', onConnectionStateChange, true);
      peerConnection.addEventListener('signalingstatechange', onSignalingStateChange, true);
      peerConnection.addEventListener('track', onTrack, true);
    }
  
    await peerConnection.setRemoteDescription(offer);
    console.log('set remote sdp OK');
  
    const sessionClientAnswer = await peerConnection.createAnswer();
    console.log('create local sdp OK');
  
    await peerConnection.setLocalDescription(sessionClientAnswer);
    console.log('set local sdp OK');
  
    return sessionClientAnswer;
  }

  
 const maxRetryCount = 3;
 const maxDelaySec = 4;
 async function fetchWithRetries(url:any, options:any, retries = 3) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries <= maxRetryCount) {
      const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) * 3000;

      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(`Request failed, retrying ${retries}/${maxRetryCount}. Error ${err}`);
      return fetchWithRetries(url, options, retries + 1);
    } else {
      throw new Error(`Max retries exceeded. error: ${err}`);
    }
  }
}
useEffect(()=>{
  async function connectionInit(){

    if (peerConnection && peerConnection.connectionState === 'connected') {
      setConnected(true)
       return;
     }
     setIniciando(true)
   
     stopAllStreams();
     closePC();
   
     try {
     const sessionResponse = await fetch(`${DID_API.url}/talks/streams`, {
       method: 'POST',
       headers: {'Authorization': `Basic ${DID_API.key}`, 'Content-Type': 'application/json'},
       body: JSON.stringify({
         source_url: "https://i.postimg.cc/fLdQq0DW/thumbnail.jpg",
       }),
  
     });
   
     const { id: newStreamId, offer, ice_servers: iceServers, session_id: newsessionId } = await sessionResponse.json()
     streamId = newStreamId;
console.log("nuevvo "+newStreamId)
sessionId=newsessionId
await setNewStream(newStreamId)

await setNewSessionId(newsessionId)
       sessionClientAnswer = await createPeerConnection(offer, iceServers);
           setConnected(true)
           setIniciando(false)
  
     } catch (e) {
       console.log('error during streaming setup', e);
       stopAllStreams();
       closePC();
              setConnected(false)
              setIniciando(false)
  
  
       return;
     }
   console.log("sdpResponse" +streamId)
     const sdpResponse = await fetch(`${DID_API.url}/talks/streams/${streamId}/sdp`,
       {
         method: 'POST',
         headers: {Authorization: `Basic ${DID_API.key}`, 'Content-Type': 'application/json'},
         body: JSON.stringify({answer: sessionClientAnswer, session_id: sessionId})
       });
     
   
  }
  
  connectionInit()
  },[])
  useEffect(() => {
    if (liveResponse) {
      const message = JSON.parse(liveResponse);
      setHistory((prev) => {
        // Si el último mensaje es del asistente, actualízalo
        if (prev[prev.length - 1]?.role === 'assistant') {
          const updatedHistory = [...prev];
          updatedHistory[updatedHistory.length - 1] = message;
          return updatedHistory;
        } else {
          // Si no, añade el nuevo mensaje del asistente
          return [...prev, message];
        }
      });
    }
  }, [liveResponse]);

  
 
  const handleUserMessage = (event:any) => {
    setUserInput(event.target.value);
  };

  useEffect(() => {
    console.log("fetcherdata "+JSON.stringify(fetcher.data));  // Inspeccionar toda la estructura de los datos
    if (fetcher.data && fetcher.data.response) {
      console.log(fetcher.data.response);  // Inspeccionar específicamente la respuesta de OpenAI
      // Asumiendo que la respuesta es un objeto y el texto está en la propiedad 'text'
      const responseText = fetcher.data.response || "Respuesta no disponible";
  
      // Agregar respuesta de ChatGPT al historial
  
      // Enviar respuesta de ChatGPT a la API de DID
      sendResponseToDID(responseText);
    }

    async function sendResponseToDID(responseText) {
      let providerList = { type: 'microsoft', voice_id: 'es-ES-AbrilNeural' };
  
      try {
        console.log("newStreamId "+newStreamId)
        console.log("newSessionId "+newSessionId)
  
        const talkResponse = await fetch(`${DID_API.url}/talks/streams/${newStreamId}`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${DID_API.key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: newSessionId,
            script: {
              type: 'text',
              subtitles: 'false',
              provider: providerList,
              ssml: false,
              input: responseText
            },
            config: {
              fluent: true,
              pad_audio: 0,
              driver_expressions: {
                expressions: [{ expression: 'neutral', start_frame: 0, intensity: 0 }],
                transition_frames: 0
              },
              align_driver: true,
              align_expand_factor: 0,
              auto_match: true,
              motion_factor: 0,
              normalization_factor: 0,
              sharpen: true,
              stitch: true,
              result_format: 'mp4'
            },
            'driver_url': 'bank://lively/',
            'config': {
              'stitch': true,
            }
          })
        });
        console.log("talkResponse ", await talkResponse.json());
      } catch (error) {
        console.error("Error while sending response to DID API: ", error);
      }
    }
  }, [fetcher.data]);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]); 
  const handleSendMessage = async () => {
    const trimmedInput = userInput.trim();
    if (trimmedInput !== '') {
      setHistory((prev) => [...prev, { role: 'user', content: trimmedInput }]);

      const formData = new FormData();
      formData.append('messages', trimmedInput);

      fetcher.submit(formData, { method: "post", action: "/api/chatgpt" });

      setLoading(true)
      console.log("entro"+peerConnection?.signalingState)
      console.log("entro"+peerConnection?.iceConnectionState)

     
        //
        // New from Jim 10/23 -- Get the user input from the text input field get ChatGPT Response
    
       setFileID("")
   
   
     
      setUserInput('');
    }
  };

  const handleKeyUp = (event:any) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };
  return (
    <div className="relative h-screen w-full lg:ps-64">
      <div className="py-10 lg:py-14">
        <div className="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl dark:text-white">
            Bienvenido a DAIOFF
          </h1>
         
          <p className="mt-3 text-gray-600 dark:text-neutral-400">
            Tu asesor laboral
          </p>
        
        </div>

        <ul className="mt-16 space-y-5 pb-32">
      
          {history.map((message, index) => (
            <li key={index} className={`max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4 ${message.role === 'assistant' ? 'bg-blue-50' : 'bg-gray-100'} rounded-lg`}>
           {<svg className="flex-shrink-0 w-[2.375rem] h-[2.375rem] rounded-full" width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="38" height="38" rx="6" fill="#2563EB"/>
          <path d="M10 28V18.64C10 13.8683 14.0294 10 19 10C23.9706 10 28 13.8683 28 18.64C28 23.4117 23.9706 27.28 19 27.28H18.25" stroke="white" stroke-width="1.5"/>
          <path d="M13 28V18.7552C13 15.5104 15.6863 12.88 19 12.88C22.3137 12.88 25 15.5104 25 18.7552C25 22 22.3137 24.6304 19 24.6304H18.25" stroke="white" stroke-width="1.5"/>
          <ellipse cx="19" cy="18.6554" rx="3.75" ry="3.6" fill="white"/>
        </svg>}

              <div className="grow mt-2 space-y-3">
                <p className={`text-${message.role === 'assistant' ? 'blue' : 'gray'}-800 dark:text-neutral-200`}>{message.content}</p>
              </div>
            </li>
          ))}
            <div ref={messagesEndRef} />  {/* Elemento vacío para controlar el scroll */}

        </ul>
      </div>
           <footer className="max-w-4xl mx-auto fixed bottom-0 left-0 right-0 z-10 p-3 sm:py-6">
           <div className="lg:hidden flex justify-end mb-2 sm:mb-3">
      <button type="button" className="p-2 inline-flex items-center gap-x-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" data-hs-overlay="#application-sidebar" aria-controls="application-sidebar" aria-label="Toggle navigation">
        <svg className="flex-shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
        <span>Sidebar</span>
      </button>
    </div>



  <div className="relative flex items-start gap-4">
  <video id="talk-video" width="150px" height="150px"  autoPlay={true} muted={false} className="flex-shrink-0 bg-gray-200 rounded-md dark:bg-neutral-700"></video>


    <div className="flex-1 flex flex-col">
    <textarea  value={userInput}
        onChange={handleUserMessage}
        onKeyUp={handleKeyUp} className="p-4 pb-12 block w-full bg-gray-100 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" placeholder="Ask me anything..."></textarea>

      <div className="flex justify-between mt-2 gap-2">
        <button
          type="button"
          className="inline-flex flex-shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:text-blue-600 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-neutral-500 dark:hover:text-blue-500"
        >
          <svg
            className="flex-shrink-0 size-4"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"
            />
          </svg>
        </button>

        <button
          onClick={handleSendMessage}
          type="button"
          id="talk-button"
          className="inline-flex flex-shrink-0 justify-center items-center size-8 rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg
            className="flex-shrink-0 size-3.5"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}
