export type bankAccountProps = {
  bank_details: {
    ifsc: string;
    account_number: string;
    bank_name: string;
    branch_name: string;
    address: string;
  };
  _id: string;
  visibleTo_Agent: boolean;
  visibleTo_Distributor: boolean;
  visibleTo_M_Distributor: boolean;
  visibleTo_API_User: boolean;
  min_Deposit_Amount: string;
  max_Deposit_Amount: string;
  modes_of_transfer: {
    transactionFeeOption: {
      for_API_user: string;
      for_Agent: string;
      for_M_Distributor: string;
      for_Distributor: string;
    };
    transactionFeeValue: {
      for_API_user: string;
      for_Agent: string;
      for_M_Distributor: string;
      for_Distributor: string;
    };
    modeId: string;
    modeName: string;
    transactionFeeType: string;
    _id: string;
  }[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
};

export type paymentModesProps = {
  transactionFeeOption: {
    for_API_user: string;
    for_Agent: string;
    for_M_Distributor: string;
    for_Distributor: string;
  };
  transactionFeeValue: {
    for_API_user: string;
    for_Agent: string;
    for_M_Distributor: string;
    for_Distributor: string;
  };
  modeId: string;
  modeName: string;
  transactionFeeType: string;
  _id: string;
};

export type fundRequestProps = {
  _id: string;
  bankId: {
    bank_details: {
      ifsc: string;
      account_number: string;
      bank_name: string;
      branch_name: string;
      address: string;
    };
    _id: string;
    min_Deposit_Amount: string;
    max_Deposit_Amount: string;
    modes_of_transfer: {
      transactionFeeType: string;
      _id: string;
    }[];
  };
  modeId: {
    transfer_mode_name: string;
    _id: string;
  };
  Charge: string;
  Commission: string;
  deposit_type: string;
  date_of_deposit: string;
  amount: string;
  transactional_details: {
    mobile: string;
    branch: string;
    trxId: string;
  };
  transactionSlip: string;
  isEditable: false;
  status: string;
  comments: string;
  fund_request_Id: string;
  createdAt: number;
  remark: string;
};
