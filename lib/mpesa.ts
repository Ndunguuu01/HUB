/**
 * Safaricom Lipa Na M-Pesa (LNM) Daraja API Client Helper Blueprint
 * This module outlines the exact steps to integrate Safaricom's STK Push payments.
 * It provides both the Production Daraja integration and a local Mock/Simulator fallback.
 */

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  callbackUrl: string;
  env: 'sandbox' | 'production';
}

const MPESA_SANDBOX_URL = 'https://sandbox.safaricom.co.ke';
const MPESA_PRODUCTION_URL = 'https://api.safaricom.co.ke';

/**
 * Normalizes phone numbers to Safaricom's preferred 2547XXXXXXXX or 2541XXXXXXXX format.
 */
export function formatPhoneNumber(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) {
    return '254' + clean.slice(1);
  }
  if (clean.startsWith('7') || clean.startsWith('1')) {
    return '254' + clean;
  }
  return clean;
}

/**
 * Custom Base64 encoder for universal compatibility (Web and Native React Native Core)
 */
function encodeBase64(str: string): string {
  try {
    return btoa(str);
  } catch (e) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let output = '';
    for (let block = 0, charCode, i = 0, map = chars;
         str.charAt(i | 0) || (map = '=', i % 1);
         output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
      charCode = str.charCodeAt(i += 3/4);
      if (charCode > 0xFF) {
        throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  }
}

/**
 * Fetches the OAuth Access Token from Safaricom Daraja.
 */
export async function getMpesaAccessToken(config: MpesaConfig): Promise<string> {
  const credentials = encodeBase64(`${config.consumerKey}:${config.consumerSecret}`);
  const baseUrl = config.env === 'sandbox' ? MPESA_SANDBOX_URL : MPESA_PRODUCTION_URL;

  const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate Daraja token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Initiates an STK Push (Lipa Na M-Pesa Online) request.
 */
export async function initiateStkPush(
  phone: string,
  amount: number,
  reference: string,
  config: MpesaConfig
): Promise<{ MerchantRequestID: string; CheckoutRequestID: string; ResponseDescription: string }> {
  
  const accessToken = await getMpesaAccessToken(config);
  const baseUrl = config.env === 'sandbox' ? MPESA_SANDBOX_URL : MPESA_PRODUCTION_URL;
  
  const formattedPhone = formatPhoneNumber(phone);
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14); // YYYYMMDDHHMMSS
  const password = encodeBase64(`${config.businessShortCode}${config.passkey}${timestamp}`);

  const payload = {
    BusinessShortCode: config.businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: formattedPhone,
    PartyB: config.businessShortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: config.callbackUrl,
    AccountReference: reference.slice(0, 12),
    TransactionDesc: `Purchase ${reference}`.slice(0, 20),
  };

  const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`STK Push failed: ${errorText}`);
  }

  return response.json();
}

/**
 * M-Pesa Transaction Simulator (Useful for local prototype testing)
 */
export async function simulateMpesaPayment(
  phone: string,
  amount: number,
  onStepChange: (step: 'validating' | 'initiating' | 'pin_entry' | 'verifying' | 'success' | 'failed') => void
): Promise<boolean> {
  const formatted = formatPhoneNumber(phone);
  
  // 1. Validation check
  onStepChange('validating');
  await new Promise(resolve => setTimeout(resolve, 800));
  if (!/^(2547|2541)\d{8}$/.test(formatted)) {
    onStepChange('failed');
    return false;
  }

  // 2. STK Initiation request simulation
  onStepChange('initiating');
  await new Promise(resolve => setTimeout(resolve, 1200));

  // 3. User PIN Entry simulation
  onStepChange('pin_entry');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 4. Verification simulation
  onStepChange('verifying');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 5. Success
  onStepChange('success');
  return true;
}
