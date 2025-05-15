import AuthForm from "@/components/auth/AuthForm";
import { Helmet } from "react-helmet";

export default function Register() {
  return (
    <>
      <Helmet>
        <title>Create Account - SEKAR NET</title>
        <meta name="description" content="Create a new SEKAR NET account to subscribe to our high-speed internet services." />
      </Helmet>
      <AuthForm />
    </>
  );
}
