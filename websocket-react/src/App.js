import { useState, useEffect } from "react";
import useUnload from "./hooks/useUnload";
import io from "socket.io-client";

function App() {
  const [socket, setSocket] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  function makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const [username, setUsername] = useState(makeid(15));

  useUnload((e) => {
    e.preventDefault();
    e.returnValue = "";

    socket.emit("leave");
    isConnected(false);
  });

  useEffect(() => {
    if (isConnected) {
      const socket = io("http://127.0.0.1:5000", {
        auth: { username: username },
      });

      setSocket(socket);

      socket.on("connect", (data) => {
        // DO SOMETHING WHEN USER CONNECTS (MAYBE MOVE INTO WAITING SCREEN?)
        console.log(data);
      });

      socket.on("disconnect", (data) => {
        // DO SOMETHING WHEN USER DISCONNECTS (SAME AS LEAVES)
        console.log(data);
      });

      socket.on("leave", (data) => {
        // DO SOMETHING WHEN USER LEAVES
        setIsConnected(false);
      });

      return function cleanup() {
        socket.disconnect();
      };
    }
  }, [isConnected, username]);

  return (
    <div>
      <button
        onClick={() => {
          setIsConnected((prevState) => {
            // SEND MESSAGE TO SOCKET THAT USER LEFT
            if (prevState) socket.emit("leave", { username: username });
            return !prevState;
          });
        }}
      >
        {isConnected ? "Disconnect" : "Connect"}
      </button>
    </div>
  );
}

export default App;
