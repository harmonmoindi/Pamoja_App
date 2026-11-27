import { AuthPage } from "@/components/auth/AuthPage";

// "Get started" opens the shared sign-in and create-account page on the "Create account" tab.
export default function Register() {
  return <AuthPage initialMode="register" />;
}
