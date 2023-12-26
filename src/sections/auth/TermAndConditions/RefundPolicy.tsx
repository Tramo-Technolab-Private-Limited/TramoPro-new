function RefundPolicy() {
  return (
    <>
      <h1>
        <strong>REFUND POLICY</strong>
      </h1>
      <p>&nbsp;</p>
      <ol>
        <li>
          <strong>Refund Eligibility</strong>
        </li>
      </ol>
      <p>&nbsp;</p>
      <p>
        {process.env.REACT_APP_COMPANY_LEGAL_NAME} is committed to ensuring
        customer satisfaction. Refunds may be considered under the following
        circumstances:
      </p>
      <p>&nbsp;</p>
      <ul>
        <li>
          <strong>Unauthorized Transactions</strong>: If a user experiences
          unauthorized transactions on their account, they must report it to{" "}
          {process.env.REACT_APP_COMPANY_LEGAL_NAME}'s Customer Support within
          three days from the transaction date for investigation.
        </li>
        <li>
          <strong>Service Disruptions</strong>: In the event of service
          disruptions or failures that result in financial losses for the user,{" "}
          {process.env.REACT_APP_COMPANY_LEGAL_NAME} will assess and consider
          refunds on a case-by-case basis.
        </li>
      </ul>
      <p>&nbsp;</p>
      <ol>
        <li>
          <strong>Refund Process</strong>
        </li>
      </ol>
      <p>&nbsp;</p>
      <p>Users seeking a refund must follow the designated process:</p>
      <p>&nbsp;</p>
      <ul>
        <li>
          <strong>Contact Customer Support</strong>: Users must report refund
          requests promptly by contacting{" "}
          {process.env.REACT_APP_COMPANY_LEGAL_NAME}'s Customer Support through{" "}
          {process.env.REACT_APP_COMPANY_EMAIL} or{" "}
          {process.env.REACT_APP_COMPANY_MOBILE},{" "}
          {process.env.REACT_APP_COMPANY_MOBILEOTHER}.
        </li>
        <li>
          <strong>Provide Necessary Information:</strong> To facilitate the
          investigation and processing of the refund, users may be required to
          provide relevant transaction details, supporting documents, and any
          other information requested by{" "}
          {process.env.REACT_APP_COMPANY_LEGAL_NAME}.
        </li>
      </ul>
      <p>&nbsp;</p>
      <ol>
        <li>
          <strong>Refund Decision</strong>
        </li>
      </ol>
      <p>&nbsp;</p>
      <p>
        Refund decisions will be made at the sole discretion of{" "}
        {process.env.REACT_APP_COMPANY_LEGAL_NAME} after a thorough review of
        the circumstances surrounding the request. Users will be notified of the
        decision through the communication channels specified in their account.
      </p>
      <p>&nbsp;</p>
      <ol>
        <li>
          <strong>Timeframe for Refund Processing</strong>
        </li>
      </ol>
      <p>&nbsp;</p>
      <p>
        Refunds, if approved, will be processed within 45 business days from the
        date of the refund approval notification. The actual time for the refund
        to reflect in the user's account may vary based on the payment method
        and the user's financial institution.
      </p>
      <p>&nbsp;</p>
      <ol>
        <li>
          <strong>Exceptions</strong>
        </li>
      </ol>
      <p>&nbsp;</p>
      <p>
        {process.env.REACT_APP_COMPANY_LEGAL_NAME} reserves the right to deny
        refund requests in cases where the user is found to be in violation of
        our Terms and Conditions.
      </p>
      <p>&nbsp;</p>
    </>
  );
}

export default RefundPolicy;
