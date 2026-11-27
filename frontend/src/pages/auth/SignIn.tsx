import { AuthPage } from "@/components/auth/AuthPage";

// "Sign in" opens the shared sign-in and create-account page on the "Sign in" tab.
export default function SignIn() {
  return <AuthPage initialMode="signin" />;
}
