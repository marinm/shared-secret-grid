import { useState, useEffect } from "react";
import { useEasyWebSocket } from "../hooks/useEasyWebSocket";
import type { Message } from "../hooks/useEasyWebSocket";

const SERVER_URL = "https://marinm.net/broadcast";

function valid(message: Message): boolean {
  return !!message;
}

type Props = {
  code: number[];
};

export default function Connection({ code }: Props) {
  const [isPaired, setIsPaired] = useState(false);
  const socket = useEasyWebSocket({ valid });
  useEffect(() => {
    if (isPaired || !socket.nextMessage) {
      return;
    }
    if (
      typeof socket.nextMessage === "string" &&
      socket.nextMessage === "hello" &&
      !isPaired
    ) {
      setIsPaired(true);
      socket.send({ message: "hello" });
    }
  }, [socket.nextMessage, isPaired]);

  useEffect(() => {
    if (socket.isOpen) {
      socket.send({ message: "hello" });
    } else {
      setIsPaired(false);
    }
  }, [socket.isOpen]);

  useEffect(() => {
    if (code.length === 4) {
      const channel = `shared-secret-grid-${code.toSorted().join("-")}`;
      const url = `${SERVER_URL}?channel=${channel}&echo=false`;
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
  }, [code]);
  return (
    <p>
      {socket.isOpen ? "Connected" : "Not connected"},{" "}
      {isPaired ? "Paired" : "Not paired"}
    </p>
  );
}
