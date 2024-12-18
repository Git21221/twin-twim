import React from "react";
import Cookies from "js-cookie";
import socketio from "socket.io-client";

const getSocket = () => {
  const accessToken = Cookies.get("accessToken");
  console.log(accessToken);

  if(!accessToken) {
    return null;
  }
  
  return socketio(import.meta.env.VITE_WEBSOCKET_BASE_URL, {
    transports: ["websocket", "polling"],
    withCredentials: true,
    auth: {
      token: accessToken,
    },
  });
};

const SocketContext = React.createContext<{
  socket: ReturnType<typeof socketio> | null;
}>({
  socket: null,
});

export const useSocket = () => React.useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = React.useState<ReturnType<
    typeof socketio
  > | null>(null);

  React.useEffect(() => {
    const newSocket = getSocket();
    setSocket(newSocket);
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
