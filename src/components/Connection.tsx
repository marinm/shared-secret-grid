import { useState, useEffect } from "react";
import { useWebSocket } from "../hooks/useEasyWebSocket";
import type { EasyWebSocket, Message } from "../hooks/useEasyWebSocket";

const SERVER_URL = "https://marinm.net/broadcast";

function valid(message: Message): boolean {
  return !!message;
}

type Props = {
  code: number[];
};

export default function Connection({ code }: Props) {
  const [isPaired, setIsPaired] = useState(false);
  const socket = useWebSocket({ valid });

  useEffect(() => {
    if (isPaired || !socket.nextMessage) {
      return;
    }
    if (doesSocketHaveConnectionMessage(socket) && !isPaired) {
      setIsPaired(true);
      socket.send({ message: "hello" });
    }
  }, [socket.nextMessage, isPaired, setIsPaired, socket.send, socket]);

  useEffect(() => {
    if (socket.isOpen) {
      socket.send({ message: "hello" });
    } else {
      setIsPaired(false);
    }
  }, [socket, socket.isOpen]);

  useEffect(() => {
    if (code.length === 4) {
      const url = getServerUrl(code);
      socket.close();
      socket.open(url);
    } else {
      socket.close();
    }

    return () => {
      if (socket.isOpen) {
        socket.close();
      }
    };
  }, [code, socket]);

  const statusText = getStatusText(isPaired, socket.isOpen);

  return <p>{statusText}</p>;
}

function getStatusText(isPaired: boolean, isOpen: boolean) {
  if (!isOpen) {
    return "Not connected";
  }
  if (isPaired) {
    return "Paired";
  }
  return "Waiting...";
}

function getServerUrl(code: number[]) {
  const channel = getChannelName(code);
  return `${SERVER_URL}?channel=${channel}&echo=false`;
}

function getChannelName(code: number[]) {
  const formattedCode = code.toSorted().join("-");

  return `shared-secret-grid-${formattedCode}`;
}

function doesSocketHaveConnectionMessage(socket: EasyWebSocket) {
  return (
    socket.nextMessage &&
    "message" in socket.nextMessage &&
    socket.nextMessage.message === "hello"
  );
}
