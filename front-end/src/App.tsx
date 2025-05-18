import type { Auth, User } from "firebase/auth";
import { useState, type FC, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Api } from "./api/Api";

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

      Api.authToken = token;
      Api.initApiClasses();

      const res = await Api.auth.login();
      if (res.Success && res.Data) {
        setResponseFromServer(
          `${res.Message} --> ID = ${res.Data.ID} EMAIL =${res.Data.Email}`
        );
      }
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
          <p>x:{responseFromServer}</p>
          <button
            onClick={async () => {
              const res = await Api.auth.login();
              console.log(res.Success);
              if (res.Success && res.Data) {
                console.log("oui");
                setResponseFromServer(
                  `${res.Message} --> ID = ${res.Data.ID} EMAIL =${res.Data.Email}`
                );
              }
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
