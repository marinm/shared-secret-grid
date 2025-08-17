import "./App.css";
import { useState, useEffect, useCallback } from "react";
import { useEasyWebSocket } from "./hooks/useEasyWebSocket";
import type { EasyWebSocketEvent, Message } from "./hooks/useEasyWebSocket";
import Grid from "./components/Grid";

const SERVER_URL = "https://marinm.net/broadcast";
const N_ROWS = 6;
const N_COLS = 7;

function valid(message: Message): boolean {
  return !!message;
}

function App() {
  const socket = useEasyWebSocket({ valid });
  const [code, setCode] = useState<number[]>([]);
  const [isPaired, setIsPaired] = useState(false);

  function onSelectedChange(numbers: number[]) {
    setCode([...numbers]);
  }

  const onMessage = useCallback(
    (event: EasyWebSocketEvent) => {
      console.log(event);
      if (
        event.message &&
        "message" in event.message &&
        event.message.message === "hello" &&
        !isPaired
      ) {
        setIsPaired(true);
        socket.send({ message: "hello" });
      }
    },
    [isPaired]
  );

  useEffect(() => {
    if (code.length === 4) {
      const channel = `shared-secret-grid-${code.toSorted().join("-")}`;
      const url = `${SERVER_URL}?channel=${channel}&echo=false`;
      socket.close();
      socket.listen(onMessage);
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

  useEffect(() => {
    socket.listen(onMessage);
  }, [onMessage]);

  useEffect(() => {
    if (socket.isOpen) {
      socket.send({ message: "hello" });
    } else {
      setIsPaired(false);
    }
  }, [socket.isOpen]);

  return (
    <>
      <div className="w-full flex flex-col justify-center items-center gap-4">
        <h1>Shared secret grid</h1>
        <Grid
          rows={N_ROWS}
          columns={N_COLS}
          onSelectedChange={onSelectedChange}
        />
        <p>
          {socket.isOpen ? "Connected" : "Not connected"},{" "}
          {isPaired ? "Paired" : "Not paired"}
        </p>
      </div>
    </>
  );
}

export default App;
