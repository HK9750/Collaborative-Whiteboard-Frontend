import { useEffect, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";
import { EVENT_NAMES } from "../utils/events";

const useWebRTC = (socket: Socket | null, roomId: string) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const initializePeerConnection = useCallback(() => {
    if (!socket) return;

    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionRef.current = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit(EVENT_NAMES.ICE_CANDIDATE, {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    return peerConnection;
  }, [socket, roomId]);

  useEffect(() => {
    if (!socket) return;

    const peerConnection = initializePeerConnection();
    if (!peerConnection) return;

    peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      dataChannelRef.current = channel;
      setupDataChannel(channel);
    };

    // WebRTC signaling
    socket.on(EVENT_NAMES.OFFER, async ({ offer }: any) => {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit(EVENT_NAMES.ANSWER, { roomId, answer });
    });

    socket.on(EVENT_NAMES.ANSWER, async ({ answer }: any) => {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on(EVENT_NAMES.ICE_CANDIDATE, async ({ candidate }: any) => {
      if (candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Create data channel if initiator
    if (socket.id) {
      const dataChannel = peerConnection.createDataChannel("whiteboard");
      dataChannelRef.current = dataChannel;
      setupDataChannel(dataChannel);

      createAndSendOffer(peerConnection);
    }

    return () => {
      peerConnection.close();
    };
  }, [socket, roomId, initializePeerConnection]);

  const setupDataChannel = (channel: RTCDataChannel) => {
    channel.onopen = () => console.log("Data channel open");
    channel.onmessage = (event) => console.log("Received data:", event.data);
    channel.onclose = () => console.log("Data channel closed");
  };

  const createAndSendOffer = async (peerConnection: RTCPeerConnection) => {
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket?.emit(EVENT_NAMES.OFFER, { roomId, offer });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const sendData = useCallback((data: any) => {
    if (dataChannelRef.current?.readyState === "open") {
      dataChannelRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { sendData };
};

export default useWebRTC;
