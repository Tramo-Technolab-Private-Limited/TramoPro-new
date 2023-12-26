import { Helmet } from "react-helmet-async";
// sections
import Register from "src/sections/auth/Register";

// ----------------------------------------------------------------------

export default function RegisterPage() {
  return (
    <>
      <Helmet>
        <title> Login | {process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>

      <Register />
    </>
  );
}
