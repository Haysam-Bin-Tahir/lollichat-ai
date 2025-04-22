import { APIContracts, APIControllers } from 'authorizenet';

// Environment setup
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
  // Add retry logic with exponential backoff
  const maxRetries = 3;
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < maxRetries) {
    try {
      // If this is a retry, add a delay with exponential backoff
      if (retryCount > 0) {
        const delayMs = 2000 * Math.pow(2, retryCount - 1); // 2s, 4s, 8s
        console.log(
          `Retry attempt ${retryCount}. Waiting ${delayMs}ms before retry...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      return await createSubscriptionAttempt(
        customerProfileId,
        customerPaymentProfileId,
        amount,
        planName,
        retryCount,
      );
    } catch (error) {
      lastError = error as Error;

      // Only retry if it's the "record cannot be found" error
      if (
        error instanceof Error &&
        error.message.includes('The record cannot be found') &&
        retryCount < maxRetries - 1
      ) {
        console.log(
          `Encountered "record cannot be found" error. Will retry (${retryCount + 1}/${maxRetries})`,
        );
        retryCount++;
      } else {
        // For other errors or if we've exhausted retries, throw the error
        throw error;
      }
    }
  }

  // This should never be reached due to the throw in the loop,
  // but TypeScript needs it for type safety
  throw lastError || new Error('Failed to create subscription after retries');
};

// The actual subscription creation attempt
const createSubscriptionAttempt = async (
  customerProfileId: string,
  customerPaymentProfileId: string,
  amount: number,
  planName: string,
  attemptNumber: number,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`=== CREATE SUBSCRIPTION: ATTEMPT ${attemptNumber + 1} ===`);
    console.log('Input parameters:', {
      customerProfileId,
      customerPaymentProfileId,
      amount,
      planName,
    });

    const merchantAuthenticationType = getMerchantAuthentication();
    console.log('Merchant authentication created');

    // Generate a unique ID that includes the attempt number to avoid duplicates
    const uniqueId = `${Date.now()}-${attemptNumber}`;
    console.log('Generated uniqueId:', uniqueId);

    try {
      // Set up subscription
      console.log('Setting up subscription object');
      const subscription = new APIContracts.ARBSubscriptionType();

      // When setting the subscription name, include the attempt number
      const subscriptionName =
        attemptNumber > 0
          ? `${planName}-retry-${attemptNumber}-${uniqueId.substring(0, 8)}`
          : planName;

      subscription.setName(subscriptionName);
      console.log('Set subscription name:', subscriptionName);

      // Set payment schedule
      console.log('Setting up payment schedule');
      const paymentSchedule = new APIContracts.PaymentScheduleType();
      const interval = new APIContracts.PaymentScheduleType.Interval();
      interval.setLength(1); // 1 month
      interval.setUnit(APIContracts.ARBSubscriptionUnitEnum.MONTHS);
      paymentSchedule.setInterval(interval);
      console.log('Set payment interval: 1 month');

      // Start date is tomorrow to ensure it's processed at 2am PST
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      // Format date as YYYY-MM-DD
      const formattedDate = startDate.toISOString().split('T')[0];
      paymentSchedule.setStartDate(formattedDate);
      console.log('Set start date:', formattedDate);

      paymentSchedule.setTotalOccurrences(9999); // Ongoing until canceled
      console.log('Set total occurrences: 9999');
      subscription.setPaymentSchedule(paymentSchedule);
      console.log('Payment schedule configured');

      // Set amount
      subscription.setAmount(amount);
      console.log('Set subscription amount:', amount);

      // Set profile
      console.log('Setting up customer profile');
      const profile = new APIContracts.CustomerProfileIdType();
      profile.setCustomerProfileId(customerProfileId);
      profile.setCustomerPaymentProfileId(customerPaymentProfileId);
      subscription.setProfile(profile);
      console.log('Customer profile configured:', {
        customerProfileId,
        customerPaymentProfileId,
      });

      // Add order information with unique reference ID
      console.log('Setting up order information');
      const order = new APIContracts.OrderType();

      // Use a shorter invoice number (max 20 chars)
      const shortInvoiceId = uniqueId.substring(0, 15); // Leave room for "INV-" prefix
      const invoiceNumber = `INV-${shortInvoiceId}`;
      order.setInvoiceNumber(invoiceNumber);
      console.log(
        'Set invoice number:',
        invoiceNumber,
        '(length:',
        invoiceNumber.length,
        ')',
      );

      order.setDescription(`Sub: ${planName}`);
      console.log('Set order description:', `Sub: ${planName}`);
      subscription.setOrder(order);
      console.log('Order information configured');

      // Create request
      console.log('Creating ARBCreateSubscriptionRequest');
      const createRequest = new APIContracts.ARBCreateSubscriptionRequest();
      createRequest.setMerchantAuthentication(merchantAuthenticationType);
      createRequest.setSubscription(subscription);
      console.log('Request configured');

      // Execute request
      console.log('Creating controller for request execution');
      const controller = new APIControllers.ARBCreateSubscriptionController(
        createRequest.getJSON(),
      );

      console.log('Setting up controller callback');
      controller.execute(() => {
        console.log('Controller execution completed');
        const apiResponse = controller.getResponse();
        console.log('Raw API response received:', apiResponse);

        const response = new APIContracts.ARBCreateSubscriptionResponse(
          apiResponse,
        );
        console.log('Parsed API response');

        if (
          response.getMessages().getResultCode() ===
          APIContracts.MessageTypeEnum.OK
        ) {
          const subscriptionId = response.getSubscriptionId();
          console.log('Subscription created successfully, ID:', subscriptionId);
          console.log('=== CREATE SUBSCRIPTION: SUCCESS ===');
          resolve(subscriptionId);
        } else {
          const errorMessages = response.getMessages().getMessage();
          const errorDetails = errorMessages.map((msg: any) => ({
            code: msg.getCode(),
            text: msg.getText(),
          }));
          console.error('Subscription creation failed:', errorDetails);
          console.log('=== CREATE SUBSCRIPTION: FAILED ===');
          reject(new Error(errorMessages[0].getText()));
        }
      });

      console.log('Setting environment for controller');
      console.log('Request sent, waiting for response...');
    } catch (error) {
      console.error(
        `=== CREATE SUBSCRIPTION: EXCEPTION (ATTEMPT ${attemptNumber + 1}) ===`,
        error,
      );
      reject(error);
    }
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
  });
};
