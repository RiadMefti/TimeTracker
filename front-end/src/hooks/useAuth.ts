import { useEffect, useCallback } from "react";
import { GoogleAuthProvider, signInWithPopup, type Auth } from "firebase/auth";
import { Api } from "../api/Api";
import { useUserStore } from "../stores/userStore";

export function useAuth(auth: Auth) {
  const { resetUser, setUser, setAuthInitialized, user } = useUserStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        Api.authToken = token;
        Api.initApiClasses();
      } else {
        Api.authToken = undefined;
      }
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, [auth, setUser, setAuthInitialized]);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    setUser(user);
    const token = await user.getIdToken();
    Api.authToken = token;
    Api.initApiClasses();
    return await Api.auth.login();
  }, [auth, setUser]);

  const signOut = useCallback(async () => {
    await auth.signOut();
    resetUser();
    Api.authToken = undefined;
  }, [auth, resetUser]);

  return { user, signInWithGoogle, signOut };
}
