/**
 * The selling entity printed in the "SOLD BY" block of every tax invoice.
 *
 * These are legal identifiers on a GST document, so they are kept in one place
 * rather than scattered through the PDF layout. Every field can be overridden
 * from the environment without a code change (useful if the GSTIN, address or
 * contact ever moves) — the defaults below are the current ones.
 */
export const SELLER = {
  name:      process.env.INVOICE_SELLER_NAME    ?? "Smart Accessories Hub",
  address1:  process.env.INVOICE_SELLER_ADDR1   ?? "15A/59 WEA Karol Bagh, Basement",
  address2:  process.env.INVOICE_SELLER_ADDR2   ?? "Near Punjab Sweets",
  city:      process.env.INVOICE_SELLER_CITY    ?? "Central Delhi 110005",
  state:     process.env.INVOICE_SELLER_STATE   ?? "Delhi",
  country:   "India",
  /** GST state code of the place of business — decides IGST vs CGST+SGST. */
  stateCode: process.env.INVOICE_SELLER_STATE_CODE ?? "07",
  phone:     process.env.INVOICE_SELLER_PHONE   ?? "+91 88004 34214",
  gstin:     process.env.INVOICE_SELLER_GSTIN   ?? "07EYWPS5792D1ZH",
  cin:       process.env.INVOICE_SELLER_CIN     ?? "U72400GJ2013PLC074576",
  website:   process.env.INVOICE_SELLER_SITE    ?? "https://www.boxdeal.in/",
  email:     process.env.INVOICE_SELLER_EMAIL   ?? "smartaccessorieshub2015@gmail.com",
} as const;
