import { useState, useRef } from "react";
import "./App.css";

// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKpE5pChw7ohWpjJ8MFYHFK0buyfQD82U",
  authDomain: "fir-superchat-2cc1a.firebaseapp.com",
  projectId: "fir-superchat-2cc1a",
  storageBucket: "fir-superchat-2cc1a.appspot.com",
  messagingSenderId: "699465597327",
  appId: "1:699465597327:web:3b8ea59b44582a3ccdcbfa",
  measurementId: "G-GGT6FXTM77",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => signOut(auth)}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, "messages");
  const q = query(messagesRef, orderBy("createdAt"), limit(25));

  const [messages] = useCollectionData(q, { idField: "id" });
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg, index) => (
            <ChatMessage key={msg.id || index} message={msg} />
          ))}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />
        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  );
}

function ChatMessage({ message }) {
  const { text, uid, photoURL } = message;

  // Determine message class based on who sent it
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  // Debugging log to check if photoURL is received correctly
  console.log("photoURL:", photoURL);

  // Use a default image if the photoURL is missing or invalid
  const defaultPhotoURL =
    "https://ui-avatars.com/api/?name=User&background=random";

  return (
    <div className={`message ${messageClass}`}>
      <img
        src={photoURL || defaultPhotoURL} // Fallback if photoURL is missing
        alt="User Avatar"
        onError={(e) => (e.target.src = defaultPhotoURL)} // Fallback if image fails to load
      />
      <p>{text}</p>
    </div>
  );
}

export default App;
