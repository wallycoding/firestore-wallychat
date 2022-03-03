import { addDoc, collection, getDocs, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { AiOutlineSend, AiFillEdit } from "react-icons/ai";
import { useStorage } from "./storage";
import { db } from "./firestore.config";
import Modal from "./components/Modal";
import audioURL from "./alert.wav";

interface MessageContent {
  type: string;
  id: string;
  author: string;
  message: string;
  date: number;
}

const changeTexWithCallback =
  (cb: React.Dispatch<React.SetStateAction<any>>) =>
  ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    cb(value);

function App() {
  const [userID, setUserID] = useStorage("user:id", "");
  const [author, setAuthor] = useStorage("user:author", "anonymous");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageContent[]>([]);

  const messagesCollectionRef = collection(db, "messages");

  useEffect(() => {
    let firstLoad = 0;
    const audio = new Audio(audioURL);
    onSnapshot(messagesCollectionRef, {
      next() {
        getAllMessage();
        if (firstLoad > 0) audio.play();
        firstLoad++;
      },
    });
    const getAllMessage = async () => {
      const response = await getDocs(messagesCollectionRef);
      const data: MessageContent[] = response.docs.map((doc) => {
        const data = doc.data() as MessageContent;
        data.id = doc.id;
        return data;
      });
      setMessages(data.sort((a, b) => (a.date > b.date ? -1 : 1)));
    };
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || !author) return;
    setMessage("");

    await addDoc(messagesCollectionRef, {
      author,
      message,
      date: Date.now(),
    });
  };

  return (
    <div className="mx-auto flex flex-col h-screen w-screen bg-gray-900">
      <div
        className={`max-w-[1000px] mx-auto flex flex-col h-screen w-screen p-2 justify-start`}
      >
        <Modal visible={Boolean(!userID)}>
          <div className="w-full h-full flex flex-1 flex-col justify-center items-center">
            <input
              value={author}
              onChange={changeTexWithCallback(setAuthor)}
              className={`flex mr-2 rounded-md bg-gray-700 outline-none p-2 text-white text-lg m-2 min-w-[400px]`}
            />
            <button
              onClick={() => {
                if (author) {
                  const id = Math.random() * 100 + Date.now();
                  setUserID(String(id));
                }
              }}
              className={`bg-gray-700 p-3 rounded-full hover:bg-gray-600 text-white font-medium`}
            >
              Finish change
            </button>
          </div>
        </Modal>
        <header className={`flex p-5 font-bold text-white text-2xl`}>
          <span>Chat Global ({author})</span>
          <button
            onClick={() => {
              setUserID("");
            }}
          >
            <AiFillEdit />
          </button>
        </header>
        <div
          className={`flex flex-1 flex-col-reverse bg-gray-700 my-2 p-2 text-white rounded-md overflow-auto scroll-m-1 border-gray-800 border-2`}
        >
          {messages.map((data) => {
            const date = new Date(data.date);
            const yearMonthDate = date.toLocaleDateString();
            const time = date.toLocaleTimeString();

            const urlRgx =
              /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;
            const links = data.message.match(urlRgx);
            const words = data.message.split(urlRgx).map(word => <>{word}</>);
            const isLink =
              Boolean(links?.length) && links?.length && words.length;
            const msg = isLink ? (
              <div className="break-all p-2 rounded-md text-gray-400 flex whitespace-pre-wrap">
                {words.reduce((previous, current, i) => {
                  return (
                    <>
                      {previous} 
                      {current}
                      <a
                        className="text-cyan-400 flex hover:text-cyan-600"
                        href={links[i - 1]}
                        target="_blank"
                      >
                        {links[i - 1]}
                      </a>
                    </>
                  );
                })}
              </div>
            ) : (
              <p className="break-all p-2 rounded-md text-gray-400">
                {data.message}
              </p>
            );

            return (
              <div
                key={data.id}
                className={`flex flex-col bg-gray-900 items-start p-2 rounded-md m-2`}
              >
                <div>
                  <span
                    className={`bg-gray-800 py-1 px-3 rounded-full text-gray-400`}
                  >
                    {data.author}
                  </span>
                  <span className="font-medium ml-2">{`${yearMonthDate} - ${time}`}</span>
                </div>
                {msg}
              </div>
            );
          })}
        </div>
        <div className={`flex my-2`}>
          <input
            value={message}
            onChange={changeTexWithCallback(setMessage)}
            onKeyDown={(event) => {
              if (event.key === "Enter") sendMessage();
            }}
            className={`flex flex-1 mr-2 rounded-md bg-gray-700 outline-none p-2 text-white text-sm`}
          />
          <button
            onClick={sendMessage}
            className={`bg-gray-700 p-3 rounded-full hover:bg-gray-600`}
          >
            <AiOutlineSend color="#FFF" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
