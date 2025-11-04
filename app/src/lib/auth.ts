
import { 
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInAnonymously,
  signOut,
} from "firebase/auth";
import { app } from "./firebase";

const auth = getAuth(app);

export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signInWithGitHub = () => {
  const provider = new GithubAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signInAsGuest = () => {
  return signInAnonymously(auth);
};

export const logout = () => {
  return signOut(auth);
};
