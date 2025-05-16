import type { Auth, User } from "firebase/auth";
import { useState, type FC, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

interface AppProps {
  auth: Auth;
}

const App: FC<AppProps> = ({ auth }) => {
  const [user, setUser] = useState<User | null>(null);
  const [responseFromServer, setResponseFromServer] = useState<string>("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      const token = await user.getIdToken();

      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + (await user.getIdToken()),
        },
      });
      setResponseFromServer(await res.text());
      console.log(user.uid);
      console.log(await user.getIdToken());
      console.log("User signed in:", user);
      console.log("Token:", token);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const disconnect = () => {
    auth.signOut();
    setUser(null);
  };

  return (
    <div>
      <h1>Time Tracker App</h1>
      {user ? (
        <div>
          <p>Welcome, {user.displayName}!</p>
          <p>Email: {user.email}</p>
          <p>{responseFromServer}</p>
          <button
            onClick={async () => {
              const res = await fetch("http://localhost:3000/hello", {
                headers: {
                  Authorization: "Bearer " + (await user.getIdToken()),
                },
              });
              setResponseFromServer(await res.text());
              console.log(user.uid);
              console.log(await user.getIdToken());
            }}
          >
            ping server
          </button>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={signInWithGoogle}>
          <span>Sign in with Google</span>
        </button>
      )}
    </div>
  );
};

export default App;
