function GrievancePolicy() {
  return (
    <>
      <h1>
        <strong>GRIEVANCE POLICY</strong>
      </h1>
      <ol>
        <li>
          <strong>Overview</strong>
        </li>
      </ol>
      <p>
        {process.env.REACT_APP_COMPANY_LEGAL_NAME} is committed to providing a
        seamless and transparent experience to its users. In the event that
        users encounter issues, disputes, or have grievances related to our
        services, we have established a Grievance Policy to address and resolve
        such matters promptly.
      </p>
      <ol>
        <li>
          <strong>Reporting Grievances</strong>
        </li>
      </ol>
      <p>
        <strong>Channels:</strong> Users can report grievances through the
        following channels:
      </p>
      <p>- Email: {process.env.REACT_APP_COMPANY_EMAIL}</p>
      <p>
        - Customer Support: {process.env.REACT_APP_COMPANY_MOBILE},{" "}
        {process.env.REACT_APP_COMPANY_MOBILEOTHER}
      </p>
      <p>
        <strong>Information Required:</strong> When reporting a grievance, users
        must provide sufficient details, including their account information,
        transaction details, and a clear description of the grievance.
      </p>
      <h2>
        <strong>Grievance Handling</strong>
      </h2>
      <ol>
        <li>
          <strong>Acknowledgment:</strong>{" "}
          {process.env.REACT_APP_COMPANY_LEGAL_NAME} will acknowledge the
          receipt of a grievance within [X] business days.
        </li>
        <li>
          <strong>Investigation:</strong> Our team will conduct a thorough
          investigation into the reported grievance to determine the root cause
          and gather all relevant information.
        </li>
        <li>
          <strong>Resolution:</strong> Based on the investigation,{" "}
          {process.env.REACT_APP_COMPANY_LEGAL_NAME} will propose a resolution
          to the user. This may include corrective actions, refunds, or any
          other appropriate remedy.
        </li>
      </ol>
      <p>
        <strong>Escalation</strong>
      </p>
      <ol>
        <li>
          <strong>Internal Escalation:</strong> If users are dissatisfied with
          the initial resolution, they have the option to escalate the grievance
          to a higher level within {process.env.REACT_APP_COMPANY_LEGAL_NAME}.
          The escalation process will be clearly communicated during the
          grievance handling.
        </li>
        <li>
          <strong>External Escalation:</strong> If the grievance remains
          unresolved, users may have the option to escalate the matter to
          relevant regulatory authorities or ombudsman services, as per
          applicable laws and regulations.
        </li>
      </ol>
      <h2>
        <strong>Communication</strong>
      </h2>
      <ol>
        <li>
          <strong>Timely Updates:</strong>{" "}
          {process.env.REACT_APP_COMPANY_LEGAL_NAME} will provide timely updates
          to users regarding the status of their reported grievances.
        </li>
        <li>
          <strong>Closure:</strong> Once a grievance is resolved,{" "}
          {process.env.REACT_APP_COMPANY_LEGAL_NAME} will communicate the
          resolution details to the user and consider the matter closed.
        </li>
      </ol>
      <h2>
        <strong>Records Keeping</strong>
      </h2>
      <p>
        {process.env.REACT_APP_COMPANY_LEGAL_NAME} will maintain records of all
        reported grievances, investigations, and resolutions for a specified
        period in compliance with applicable laws.
      </p>
      <h2>
        <strong>SETTLEMENT</strong>
      </h2>
      <ol>
        <li>
          <strong>Fund Settlements</strong>
        </li>
      </ol>
      <p>
        {process.env.REACT_APP_COMPANY_LEGAL_NAME} facilitates fund settlements
        based on the nature of transactions and the services provided. The
        following terms apply:
      </p>
      <ol>
        <li>
          <strong>Transaction Period:</strong> Settlements are typically
          processed within a specified period after the completion of the
          transaction, as outlined in the respective service agreements.
        </li>
        <li>
          <strong>Account Verification:</strong> Users must ensure the accuracy
          of their bank or financial institution details for successful
          settlements. {process.env.REACT_APP_COMPANY_LEGAL_NAME} is not liable
          for settlement failures due to incorrect account information.
        </li>
      </ol>
      <ol>
        <li>
          <strong>Fee Deductions</strong>
        </li>
        <li>
          <strong>Transaction Fees:</strong> Transaction fees, if applicable,
          will be deducted from the settlement amount. Users are advised to
          review the applicable fee structure before initiating transactions.
        </li>
      </ol>
      <ol>
        <li>
          <strong>Timing of Settlements</strong>
        </li>
        <li>
          <strong>Regular Settlements:</strong> Standard settlement cycles are
          defined for different services. Users will be notified of the expected
          settlement timeframe for each type of transaction.
        </li>
        <li>
          <strong>Exceptions:</strong> Delays in settlements may occur due to
          unforeseen circumstances or issues beyond{" "}
          {process.env.REACT_APP_COMPANY_LEGAL_NAME}'s control. Users will be
          promptly informed of any delays.
        </li>
      </ol>
      <ol>
        <li>
          <strong>Disputed Settlements</strong>
        </li>
        <li>
          <strong>Dispute Resolution Process:</strong> In the event of a dispute
          related to settlements, users must notify{" "}
          {process.env.REACT_APP_COMPANY_LEGAL_NAME} promptly.{" "}
          {process.env.REACT_APP_COMPANY_LEGAL_NAME} will conduct a thorough
          investigation and resolve the dispute in accordance with its dispute
          resolution policies.
        </li>
        <li>
          <strong>Pending Settlements:</strong> If a settlement is under
          dispute, {process.env.REACT_APP_COMPANY_LEGAL_NAME} reserves the right
          to withhold the settlement amount until the dispute is resolved.
        </li>
      </ol>
      <ol>
        <li>
          <strong>Taxes and Withholding</strong>
        </li>
        <li>
          <strong>Tax Liability:</strong> Users are solely responsible for any
          tax liabilities arising from settlements.{" "}
          {process.env.REACT_APP_COMPANY_LEGAL_NAME} may withhold taxes as
          required by applicable laws.
        </li>
        <li>
          <strong>Reporting:</strong> {process.env.REACT_APP_COMPANY_LEGAL_NAME}{" "}
          may provide users with relevant transaction details for tax reporting
          purposes upon request.
        </li>
      </ol>
    </>
  );
}

export default GrievancePolicy;
