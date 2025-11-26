import { getAuth, signInAnonymously } from "firebase/auth";

/**
 * A non-blocking wrapper around Firebase's signInAnonymously.
 * 
 * This function is designed to be used in a fire-and-forget manner, where you don't
 * need to wait for the sign-in process to complete. It will not block the main thread,
 * and it will not throw any errors that you need to handle.
 * 
 * It is particularly useful for scenarios where you want to ensure a user is signed in
 * before they perform any actions that require authentication, without having to make
 * them wait for the sign-in process to complete.
 */
export function signInAnonymouslyNonBlocking() {
  // signInAnonymously(getAuth()).catch((error) => {
  //   // We are not throwing the error here because we don't want to block the
  //   // main thread. We are only logging it to the console for debugging purposes.
  //   console.error("Non-blocking anonymous sign-in failed:", error);
  // });
}
