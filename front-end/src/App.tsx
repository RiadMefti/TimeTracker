import type { Auth } from "firebase/auth";
import { useState, type FC } from "react";
import { Api } from "./api/Api";
import { useAuth } from "./hooks/useAuth";
import Menu from "./components/menu/Menu";

interface AppProps {
  auth: Auth;
}

const App: FC<AppProps> = ({ auth }) => {
  const { user, signInWithGoogle, signOut } = useAuth(auth);
  const [responseFromServer, setResponseFromServer] = useState<string>("");

  return (
    <div>
      <Menu />
      <h1>Time Tracker App</h1>
      {user ? (
        <div>
          <p>Welcome, {user.displayName}!</p>
          <p>Email: {user.email}</p>
          <p>x:{responseFromServer}</p>
          <button
            onClick={async () => {
              const res = await Api.auth.login();
              if (res.Success && res.Data) {
                setResponseFromServer(
                  `${res.Message} --> ID = ${res.Data.ID} EMAIL =${res.Data.Email}`
                );
              }
            }}
          >
            ping server
          </button>
          <button onClick={signOut}>Disconnect</button>
        </div>
      ) : (
        <button
          onClick={async () => {
            await signInWithGoogle();
          }}
        >
          <span>Sign in with Google</span>
        </button>
      )}
    </div>
  );
};

export default App;
