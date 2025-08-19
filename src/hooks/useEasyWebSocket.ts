import { useCallback, useEffect, useRef, useState } from "react";

// Some of the benefits of this WebSocket wrapper:
//   - null-safe: the wrapper is never null
//   - lazy: can create without connecting
//   - type-safe: send() enforces valid Message type
//   - validation: the message listener always receives a valid message
//   - order safety: each method checks current state before running

// Valid JSON can be parsed into any of these types:
//   - Object
//   - Array
//   - string
//   - number
//   - boolean
//   - null
// Allow only non-null objects.
export type Message = NonNullable<object>;

const CONNECTION_MESSAGE = "hello";

function isMessage(message: unknown): message is Message {
  return message !== null && typeof message === "object";
}

export type EasyWebSocket = {
  isOnline: boolean;
  isOpen: boolean;
  error: boolean;
  open: (url: string) => void;
  send: (message: Message) => void;
  close: () => void;
  nextMessage: null | Message;

  isReadyToConnect(): boolean;
  initializeConnection(): void;
};

type Options = {
  valid: (message: Message) => boolean;
};

export function useWebSocket(options: Options): EasyWebSocket {
  const websocketRef = useRef<null | WebSocket>(null);
  const [isOnline, setIsOnline] = useState<boolean>(window.navigator.onLine);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [nextMessage, setNextMessage] = useState<null | Message>(null);

  function reasonError(method: string, reason: string) {
    console.log(`ignoring ${method}() because ${reason}`);
  }

  const open = useCallback(
    (url: string) => {
      if (websocketRef.current !== null) {
        reasonError("open", "already open");
        return;
      }
      websocketRef.current = new WebSocket(url);

      const websocket = websocketRef.current;

      websocket.onopen = () => {
        setIsOpen(true);
        setError(false);
        console.log("✅ Connected");
      };

      websocket.onmessage = (event) => {
        const message = parseJSON(event.data);
        if (isMessage(message) && options.valid(message)) {
          console.log("✉️ valid message received");
          setNextMessage(message);
        } else {
          console.log("🚫 invalid message received");
          return;
        }
      };

      websocket.onclose = () => {
        setIsOpen(false);
        setNextMessage(null);
        console.log("❌ Disconnected");
        websocketRef.current = null;
      };

      websocket.onerror = (err) => {
        console.log(err);
        setError(true);
      };
    },
    [options]
  );

  const send = useCallback((message: Message) => {
    if (websocketRef.current === null) {
      if (websocketRef.current === null) {
        reasonError("send", "closed");
        return;
      }
      return;
    }

    if (websocketRef.current.readyState != WebSocket.OPEN) {
      return;
    }
    websocketRef.current.send(JSON.stringify(message));
  }, []);

  const close = useCallback(() => {
    if (websocketRef.current === null) {
      reasonError("close", "already closed");
      return;
    }

    if (
      websocketRef.current.readyState === WebSocket.CLOSING ||
      websocketRef.current.readyState === WebSocket.CLOSED
    ) {
      reasonError("close", "already closed");
      return;
    }

    if (websocketRef.current.readyState === WebSocket.CONNECTING) {
      reasonError("close", "connecting in progress");
      return;
    }

    if (websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.close();
      return;
    }

    reasonError("close", "uncaught readyState");
  }, []);

  const isReadyToConnect = useCallback(() => {
    return (
      !!nextMessage &&
      "message" in nextMessage &&
      nextMessage.message === CONNECTION_MESSAGE
    );
  }, [nextMessage]);

  const initializeConnection = useCallback(() => {
    if (isReadyToConnect()) {
      send({ message: CONNECTION_MESSAGE });
    }
  }, [isReadyToConnect, send]);

  useEffect(() => {
    console.log("add online listener");
    const onOnline = () => {
      console.log("✅ online");
      setIsOnline(true);
    };
    const onOffline = () => {
      console.log("❌ offline");
      setIsOnline(false);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      close();
      console.log("remove online listener");
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [close]);

  return {
    isOnline,
    isOpen,
    error,
    open,
    send,
    close,
    nextMessage,
    isReadyToConnect,
    initializeConnection,
  };
}

function parseJSON(message: string): unknown {
  try {
    return JSON.parse(message);
  } catch (e) {
    console.error(e);
    return null;
  }
}
