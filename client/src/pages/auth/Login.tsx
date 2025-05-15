import AuthForm from "@/components/auth/AuthForm";
import { Helmet } from "react-helmet";

export default function Login() {
  return (
    <>
      <Helmet>
        <title>Login - SEKAR NET</title>
        <meta name="description" content="Login to your SEKAR NET account to manage your internet service subscription, billing, and support tickets." />
      </Helmet>
      <AuthForm />
    </>
  );
}
