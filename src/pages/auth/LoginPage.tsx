import { Helmet } from "react-helmet-async";
// sections
import Login from "../../sections/auth/Login";

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Login | {process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>

      <Login />
    </>
  );
}
