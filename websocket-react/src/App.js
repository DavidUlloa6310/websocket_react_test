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

    socket.emit("playerLeave", { username: username });
    socket.disconnect();
    isConnected(false);
  });

  useEffect(() => {
    if (isConnected) {
      const socket = io("http://127.0.0.1:5000/play", {
        auth: { username: username },
      });

      setSocket(socket);

      socket.on("startGame", (data) => {
        console.log(
          `Game started! Room name: ${data.roomName}, Opponent name: ${data.opponentName}`
        );
      });

      socket.on("finishedWaitingRoom", (data) => {
        console.log("Received 'finishedWaitingRoom'...");
        socket.emit("readyGame", {
          roomName: data.roomName,
          opponentName: data.opponentName,
        });
      });

      socket.on("finishedGame", (data) => {
        console.log(
          `Finished game. Looser: ${data.lostPlayer}, Winner: ${data.wonPlayer}`
        );
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
            if (prevState) socket.emit("playerLeave", { username: username });
            return !prevState;
          });
        }}
      >
        {isConnected ? "Disconnect" : "Connect"}
      </button>
      {isConnected && (
        <button
          onClick={() => {
            socket.emit("joinGame", { username: username });
          }}
        >
          Start Game
        </button>
      )}

      {isConnected && (
        <button
          onClick={() => {
            console.log("Emitting playerLeave...");
            socket.emit("playerLeave", { username: username });
          }}
        >
          Leave Game
        </button>
      )}
    </div>
  );
}

export default App;
