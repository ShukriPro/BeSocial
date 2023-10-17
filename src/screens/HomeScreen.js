import React, { useRef, useState } from "react";
// Firebase imports
import logo from "../assets/Be.jpg";
import "../styles/Chat.css";
import "../styles/SignIn.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";

// Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhDM5BTEy4Jb4AQ_FKFoo9tf2_UQ5C3Rg",
  authDomain: "besocial-4b950.firebaseapp.com",
  projectId: "besocial-4b950",
  storageBucket: "besocial-4b950.appspot.com",
  messagingSenderId: "262414404052",
  appId: "1:262414404052:web:21cc798a2fea3fd367ae41",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function HomeScreen() {
  const [user] = useAuthState(auth);

  return (
    <div>
      <header className="SignOutHeader">
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
      <div className="signInContainer">
        <img className="beLogo" src={logo} alt="Logo" />
        <h1 className="welcome-text">Welcome to Besocial</h1>
        <button className="sign-in" onClick={signInWithGoogle}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
            alt="Google logo"
          />
          Continue with Google
        </button>
      </div>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => signOut(auth)}>
        <i className="fas fa-power-off"></i> Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, "messages");
  const chatQuery = query(messagesRef, orderBy("createdAt"), limit(25));

  const [messages] = useCollectionData(chatQuery, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const [user] = useAuthState(auth);
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

  //Created date

  return (
    <>
      <form onSubmit={sendMessage}>
        <div class="userDiv">
          <div className="user-profile">
            {user && (
              <>
                <img
                  src={
                    user.photoURL ||
                    "https://api.adorable.io/avatars/23/abott@adorable.png"
                  }
                  alt="User Profile"
                  className="user-avatar" // Add this if you want to style it further in CSS
                />
              </>
            )}
          </div>
        </div>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="What's on your mind?"
        />
        <div class="userDiv">
          <button class="btnPost" type="submit" disabled={!formValue}>
            🐥
          </button>
        </div>
      </form>
      <main>
        {messages &&
          messages.map((msg) => (
            <>
              <ChatMessage key={msg.id} message={msg} />
            </>
          ))}
        <span ref={dummy}></span>
      </main>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, createdAt } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  const formattedDate = createdAt
    ? new Date(createdAt.seconds * 1000).toLocaleString()
    : "";

  return (
    <div className={`message ${messageClass}`}>
      <div class="post-header">
        <div class="top-header-post">
          <img
            className="user-profile-post"
            src={
              photoURL ||
              "https://api.adorable.io/avatars/23/abott@adorable.png"
            }
            alt="User Avatar"
          />
          <span className="message-date">
            {createdAt ? createdAt.toDate().toString() : ""}
          </span>
        </div>
      </div>
      <p className="message-text">{text}</p>
    </div>
  );
}

export default HomeScreen;
