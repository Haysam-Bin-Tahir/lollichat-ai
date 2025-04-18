import { APIContracts, APIControllers } from 'authorizenet';

// Environment setup
const isProduction = process.env.NODE_ENV === 'production';
const apiLoginKey = process.env.AUTHORIZE_NET_API_LOGIN_ID || '';
const transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY || '';

// Local constants instead of importing from authorizenet/lib/constants
const ENDPOINTS = {
  sandbox: 'https://apitest.authorize.net/xml/v1/request.api',
  production: 'https://api.authorize.net/xml/v1/request.api',
};

// Create merchant authentication
const getMerchantAuthentication = () => {
  console.log('API Login ID:', apiLoginKey);
  console.log('Transaction Key:', `${transactionKey.substring(0, 3)}...`);

  const merchantAuthenticationType =
    new APIContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(apiLoginKey);
  merchantAuthenticationType.setTransactionKey(transactionKey);
  return merchantAuthenticationType;
};

// Create a customer profile
export const createCustomerProfile = async (
  email: string,
  firstName: string,
  lastName: string,
  cardNumber: string,
  expirationDate: string, // Format: YYYY-MM
  cardCode: string,
): Promise<{
  customerProfileId: string;
  customerPaymentProfileId: string;
}> => {
  return new Promise((resolve, reject) => {
    const merchantAuthenticationType = getMerchantAuthentication();

    // Set up payment data
    const creditCard = new APIContracts.CreditCardType();
    creditCard.setCardNumber(cardNumber);
    creditCard.setExpirationDate(expirationDate);
    creditCard.setCardCode(cardCode);

    const paymentType = new APIContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    // Set up billing info
    const billTo = new APIContracts.CustomerAddressType();
    billTo.setFirstName(firstName);
    billTo.setLastName(lastName);

    // Set up payment profile
    const paymentProfile = new APIContracts.CustomerPaymentProfileType();
    paymentProfile.setPayment(paymentType);
    paymentProfile.setBillTo(billTo);

    // Set up customer profile
    const customerProfile = new APIContracts.CustomerProfileType();
    customerProfile.setEmail(email);
    customerProfile.setPaymentProfiles([paymentProfile]);

    // Create request
    const createRequest = new APIContracts.CreateCustomerProfileRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setProfile(customerProfile);

    // Execute request
    const controller = new APIControllers.CreateCustomerProfileController(
      createRequest.getJSON(),
    );

    controller.execute(() => {
      const apiResponse = controller.getResponse();
      const response = new APIContracts.CreateCustomerProfileResponse(
        apiResponse,
      );

      if (
        response.getMessages().getResultCode() ===
        APIContracts.MessageTypeEnum.OK
      ) {
        resolve({
          customerProfileId: response.getCustomerProfileId(),
          customerPaymentProfileId: response
            .getCustomerPaymentProfileIdList()
            .getNumericString()[0],
        });
      } else {
        const errorMessages = response.getMessages().getMessage();
        const errorText = errorMessages[0].getText();
        const errorCode = errorMessages[0].getCode();

        // Check if this is a duplicate profile error
        if (
          errorText.includes('duplicate record') &&
          errorText.includes('already exists')
        ) {
          // Extract the profile ID from the error message
          const match = errorText.match(/ID (\d+)/);
          if (match?.length && match[1]) {
            const existingProfileId = match[1];
            console.log(
              `Customer profile already exists with ID: ${existingProfileId}`,
            );

            // Now create a payment profile for this existing customer
            createPaymentProfileForExistingCustomer(
              existingProfileId,
              cardNumber,
              expirationDate,
              cardCode,
              firstName,
              lastName,
            )
              .then((paymentProfileId) => {
                resolve({
                  customerProfileId: existingProfileId,
                  customerPaymentProfileId: paymentProfileId,
                });
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            reject(
              new Error(
                `Duplicate profile error but couldn't extract ID: ${errorText}`,
              ),
            );
          }
        } else {
          reject(new Error(errorText));
        }
      }
    });

    controller.setEnvironment(
      isProduction ? ENDPOINTS.production : ENDPOINTS.sandbox,
    );
  });
};

// Helper function to create a payment profile for an existing customer
const createPaymentProfileForExistingCustomer = async (
  customerProfileId: string,
  cardNumber: string,
  expirationDate: string,
  cardCode: string,
  firstName: string,
  lastName: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const merchantAuthenticationType = getMerchantAuthentication();

    // First try to get existing payment profiles
    const getRequest = new APIContracts.GetCustomerProfileRequest();
    getRequest.setMerchantAuthentication(merchantAuthenticationType);
    getRequest.setCustomerProfileId(customerProfileId);

    const getController = new APIControllers.GetCustomerProfileController(
      getRequest.getJSON(),
    );

    getController.execute(() => {
      const apiResponse = getController.getResponse();
      const response = new APIContracts.GetCustomerProfileResponse(apiResponse);

      if (
        response.getMessages().getResultCode() ===
        APIContracts.MessageTypeEnum.OK
      ) {
        // Check if profile has payment profiles
        const profile = response.getProfile();
        const paymentProfiles = profile.getPaymentProfiles();

        if (paymentProfiles && paymentProfiles.length > 0) {
          // Use the first payment profile
          console.log('Using existing payment profile');
          resolve(paymentProfiles[0].getCustomerPaymentProfileId());
          return;
        }

        // If no payment profiles, create one
        createNewPaymentProfile();
      } else {
        // If error getting profile, try creating payment profile
        createNewPaymentProfile();
      }
    });

    getController.setEnvironment(
      isProduction ? ENDPOINTS.production : ENDPOINTS.sandbox,
    );

    // Function to create a new payment profile
    function createNewPaymentProfile() {
      // Set up credit card info
      const creditCard = new APIContracts.CreditCardType();
      creditCard.setCardNumber(cardNumber);
      creditCard.setExpirationDate(expirationDate);
      creditCard.setCardCode(cardCode);

      const paymentType = new APIContracts.PaymentType();
      paymentType.setCreditCard(creditCard);

      // Set up billing info
      const billTo = new APIContracts.CustomerAddressType();
      billTo.setFirstName(firstName);
      billTo.setLastName(lastName);

      // Set up payment profile
      const paymentProfile = new APIContracts.CustomerPaymentProfileType();
      paymentProfile.setPayment(paymentType);
      paymentProfile.setBillTo(billTo);

      // Create request
      const createRequest =
        new APIContracts.CreateCustomerPaymentProfileRequest();
      createRequest.setMerchantAuthentication(merchantAuthenticationType);
      createRequest.setCustomerProfileId(customerProfileId);
      createRequest.setPaymentProfile(paymentProfile);

      // Execute request
      const controller =
        new APIControllers.CreateCustomerPaymentProfileController(
          createRequest.getJSON(),
        );

      controller.execute(() => {
        const apiResponse = controller.getResponse();
        const response = new APIContracts.CreateCustomerPaymentProfileResponse(
          apiResponse,
        );

        if (
          response.getMessages().getResultCode() ===
          APIContracts.MessageTypeEnum.OK
        ) {
          resolve(response.getCustomerPaymentProfileId());
        } else {
          const errorMessages = response.getMessages().getMessage();
          const errorText = errorMessages[0].getText();

          // Check if this is a duplicate payment profile error
          if (
            errorText.includes('duplicate') &&
            errorText.includes('payment profile')
          ) {
            // Try to get existing payment profiles again
            getExistingPaymentProfiles();
          } else {
            reject(new Error(errorText));
          }
        }
      });

      controller.setEnvironment(
        isProduction ? ENDPOINTS.production : ENDPOINTS.sandbox,
      );
    }

    // Function to get existing payment profiles as fallback
    function getExistingPaymentProfiles() {
      const getRequest = new APIContracts.GetCustomerProfileRequest();
      getRequest.setMerchantAuthentication(merchantAuthenticationType);
      getRequest.setCustomerProfileId(customerProfileId);

      const getController = new APIControllers.GetCustomerProfileController(
        getRequest.getJSON(),
      );

      getController.execute(() => {
        const apiResponse = getController.getResponse();
        const response = new APIContracts.GetCustomerProfileResponse(
          apiResponse,
        );

        if (
          response.getMessages().getResultCode() ===
          APIContracts.MessageTypeEnum.OK
        ) {
          const profile = response.getProfile();
          const paymentProfiles = profile.getPaymentProfiles();

          if (paymentProfiles && paymentProfiles.length > 0) {
            // Use the first payment profile
            console.log('Using existing payment profile after duplicate error');
            resolve(paymentProfiles[0].getCustomerPaymentProfileId());
          } else {
            reject(
              new Error('No payment profiles found after duplicate error'),
            );
          }
        } else {
          reject(
            new Error('Failed to get customer profile after duplicate error'),
          );
        }
      });

      getController.setEnvironment(
        isProduction ? ENDPOINTS.production : ENDPOINTS.sandbox,
      );
    }
  });
};

// Create a subscription
export const createSubscription = async (
  customerProfileId: string,
  customerPaymentProfileId: string,
  amount: number,
  planName: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(
      'Creating subscription',
      customerProfileId,
      customerPaymentProfileId,
      amount,
      planName,
    );
    const merchantAuthenticationType = getMerchantAuthentication();

    const uniqueId = `${Date.now()}`;

    // Set up subscription
    const subscription = new APIContracts.ARBSubscriptionType();
    subscription.setName(`${planName}-${uniqueId}`);

    // Set payment schedule
    const paymentSchedule = new APIContracts.PaymentScheduleType();
    const interval = new APIContracts.PaymentScheduleType.Interval();
    interval.setLength(1); // 1 month
    interval.setUnit(APIContracts.ARBSubscriptionUnitEnum.MONTHS);
    paymentSchedule.setInterval(interval);

    // Start date is tomorrow to ensure it's processed at 2am PST
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    // Format date as YYYY-MM-DD
    const formattedDate = startDate.toISOString().split('T')[0];
    paymentSchedule.setStartDate(formattedDate);

    paymentSchedule.setTotalOccurrences(9999); // Ongoing until canceled
    subscription.setPaymentSchedule(paymentSchedule);

    // Set amount
    subscription.setAmount(amount);

    // Set profile
    const profile = new APIContracts.CustomerProfileIdType();
    profile.setCustomerProfileId(customerProfileId);
    profile.setCustomerPaymentProfileId(customerPaymentProfileId);
    subscription.setProfile(profile);

    // Add order information with shorter unique reference ID
    // Authorize.Net has a 20-character limit for invoice numbers
    const order = new APIContracts.OrderType();
    order.setInvoiceNumber(`INV-${uniqueId}`); // Much shorter invoice number
    order.setDescription(`Sub: ${planName}`); // Shorter description
    subscription.setOrder(order);

    // Create request
    const createRequest = new APIContracts.ARBCreateSubscriptionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setSubscription(subscription);

    // Execute request
    const controller = new APIControllers.ARBCreateSubscriptionController(
      createRequest.getJSON(),
    );

    controller.execute(() => {
      const apiResponse = controller.getResponse();
      const response = new APIContracts.ARBCreateSubscriptionResponse(
        apiResponse,
      );

      if (
        response.getMessages().getResultCode() ===
        APIContracts.MessageTypeEnum.OK
      ) {
        resolve(response.getSubscriptionId());
      } else {
        const errorMessages = response.getMessages().getMessage();
        reject(new Error(errorMessages[0].getText()));
      }
    });

    controller.setEnvironment(
      isProduction ? ENDPOINTS.production : ENDPOINTS.sandbox,
    );
  });
};

// Validate payment method with a $0 authorization
export const validatePaymentMethod = async (
  cardNumber: string,
  expirationDate: string,
  cardCode: string,
  firstName: string,
  lastName: string,
): Promise<string> => {
  console.log('Starting payment validation...');
  return new Promise((resolve, reject) => {
    console.log('Setting up merchant authentication');
    const merchantAuthenticationType = getMerchantAuthentication();
    console.log('Merchant auth created:', !!merchantAuthenticationType);

    // Set up credit card info
    console.log('Setting up credit card info');
    const creditCard = new APIContracts.CreditCardType();
    creditCard.setCardNumber(cardNumber);
    creditCard.setExpirationDate(expirationDate);
    creditCard.setCardCode(cardCode);
    console.log('Credit card info set up');

    // Set up payment type
    console.log('Setting up payment type');
    const paymentType = new APIContracts.PaymentType();
    paymentType.setCreditCard(creditCard);
    console.log('Payment type set up');

    // Set up transaction request
    console.log('Setting up transaction request');
    const transactionRequestType = new APIContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(
      APIContracts.TransactionTypeEnum.AUTHONLYTRANSACTION,
    );
    transactionRequestType.setPayment(paymentType);
    transactionRequestType.setAmount(5); // $5 authorization
    console.log('Transaction request set up');

    // Set billing info
    console.log('Setting up billing info');
    const billTo = new APIContracts.CustomerAddressType();
    billTo.setFirstName(firstName);
    billTo.setLastName(lastName);
    transactionRequestType.setBillTo(billTo);
    console.log('Billing info set up');

    // Create request
    console.log('Creating transaction request');
    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);
    console.log('Transaction request created');

    // Execute request
    console.log('Creating transaction controller');
    const controller = new APIControllers.CreateTransactionController(
      createRequest.getJSON(),
    );
    console.log('Transaction controller created');

    console.log('Setting environment');
    controller.setEnvironment(
      isProduction ? ENDPOINTS.production : ENDPOINTS.sandbox,
    );
    console.log('Environment set, executing request...');

    controller.execute(() => {
      console.log('Request executed, processing response');
      const apiResponse = controller.getResponse();
      console.log('API Response received:', !!apiResponse);

      if (!apiResponse) {
        console.error('API Response is null or undefined');
        reject(new Error('No response from payment gateway'));
        return;
      }

      console.log('Creating transaction response object');
      const response = new APIContracts.CreateTransactionResponse(apiResponse);
      console.log('Transaction response created', response);

      if (
        response.getMessages().getResultCode() ===
        APIContracts.MessageTypeEnum.OK
      ) {
        console.log('Transaction successful');
        const transactionResponse = response.getTransactionResponse();
        console.log('Transaction ID:', transactionResponse.getTransId());
        resolve(transactionResponse.getTransId());
      } else {
        console.log('Transaction failed');
        let errorMessage = 'Payment validation failed';

        if (response.getMessages() !== null) {
          const messages = response.getMessages().getMessage();
          errorMessage = messages[0].getText();
          console.error('API Error message:', errorMessage);
        }

        if (
          response.getTransactionResponse() !== null &&
          response.getTransactionResponse().getErrors() !== null
        ) {
          const errors = response
            .getTransactionResponse()
            .getErrors()
            .getError();
          errorMessage = errors[0].getErrorText();
          console.error('Transaction Error message:', errorMessage);
        }

        reject(new Error(errorMessage));
      }
    });
  });
};

// Void a transaction
export const voidTransaction = async (
  transactionId: string,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const merchantAuthenticationType = getMerchantAuthentication();

    // Set up transaction request
    const transactionRequestType = new APIContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(
      APIContracts.TransactionTypeEnum.VOIDTRANSACTION,
    );
    transactionRequestType.setRefTransId(transactionId);

    // Create request
    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    // Execute request
    const controller = new APIControllers.CreateTransactionController(
      createRequest.getJSON(),
    );

    controller.execute(() => {
      const apiResponse = controller.getResponse();
      const response = new APIContracts.CreateTransactionResponse(apiResponse);

      if (
        response.getMessages().getResultCode() ===
        APIContracts.MessageTypeEnum.OK
      ) {
        resolve(true);
      } else {
        let errorMessage = 'Void transaction failed';

        if (response.getMessages() !== null) {
          const messages = response.getMessages().getMessage();
          errorMessage = messages[0].getText();
        }

        reject(new Error(errorMessage));
      }
    });

    controller.setEnvironment(
      isProduction ? ENDPOINTS.production : ENDPOINTS.sandbox,
    );
  });
};

// Cancel a subscription
export const cancelSubscription = async (
  subscriptionId: string,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const merchantAuthenticationType = getMerchantAuthentication();

    // Create request
    const createRequest = new APIContracts.ARBCancelSubscriptionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setSubscriptionId(subscriptionId);

    // Execute request
    const controller = new APIControllers.ARBCancelSubscriptionController(
      createRequest.getJSON(),
    );

    controller.execute(() => {
      const apiResponse = controller.getResponse();
      const response = new APIContracts.ARBCancelSubscriptionResponse(
        apiResponse,
      );

      if (
        response.getMessages().getResultCode() ===
        APIContracts.MessageTypeEnum.OK
      ) {
        resolve(true);
      } else {
        const errorMessages = response.getMessages().getMessage();
        reject(new Error(errorMessages[0].getText()));
      }
    });

    controller.setEnvironment(
      isProduction ? ENDPOINTS.production : ENDPOINTS.sandbox,
    );
  });
};
