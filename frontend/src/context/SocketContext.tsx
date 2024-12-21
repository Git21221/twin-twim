import React from "react";
import Cookies from "js-cookie";
import { io } from "socket.io-client";

const getSocket = () => {
  const accessToken = Cookies.get("accessToken");

  if (!accessToken) {
    return null;
  }

  return io(import.meta.env.VITE_WEBSOCKET_BASE_URL, {
    transports: ["websocket"],
    withCredentials: true,
    auth: {
      token: accessToken,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });
};

const SocketContext = React.createContext<{
  socket: ReturnType<typeof io> | null;
}>({
  socket: null,
});

export const useSocket = () => React.useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = React.useState<ReturnType<typeof io> | null>(
    null
  );

  React.useEffect(() => {
    const newSocket = getSocket();
    setSocket(newSocket);
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
