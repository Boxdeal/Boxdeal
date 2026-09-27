import { SELLER } from "./seller";

/**
 * GST maths for the tax invoice.
 *
 * Two rules drive everything here:
 *
 * 1. PRICES ARE TAX-INCLUSIVE. A product listed at ₹200 is ₹200 to the
 *    customer — GST is already inside it. So the invoice works BACKWARDS:
 *    taxable value = paid / (1 + rate), and the tax is the remainder. The
 *    customer never sees a number added on top of the price they agreed to.
 *
 * 2. THE INVOICE MUST RECONCILE TO THE RUPEE. Every taxable value + every tax
 *    amount, summed, has to equal orders.total_amount exactly. Rounding each
 *    line independently drifts by a paisa or two, so the split is computed on
 *    the line's inclusive total (which is exact) and the derived parts absorb
 *    the rounding — never the other way round.
 */

/** Flat GST rate applied to every product and to the delivery charge. */
export const GST_RATE = 18;

/** GST state codes, keyed by the lowercased state name we store on an order. */
const STATE_CODES: Record<string, string> = {
  "jammu and kashmir": "01",
  "himachal pradesh": "02",
  "punjab": "03",
  "chandigarh": "04",
  "uttarakhand": "05",
  "haryana": "06",
  "delhi": "07",
  "rajasthan": "08",
  "uttar pradesh": "09",
  "bihar": "10",
  "sikkim": "11",
  "arunachal pradesh": "12",
  "nagaland": "13",
  "manipur": "14",
  "mizoram": "15",
  "tripura": "16",
  "meghalaya": "17",
  "assam": "18",
  "west bengal": "19",
  "jharkhand": "20",
  "odisha": "21",
  "chhattisgarh": "22",
  "madhya pradesh": "23",
  "gujarat": "24",
  "daman and diu": "26",
  "dadra and nagar haveli": "26",
  "dadra and nagar haveli and daman and diu": "26",
  "maharashtra": "27",
  "karnataka": "29",
  "goa": "30",
  "lakshadweep": "31",
  "kerala": "32",
  "tamil nadu": "33",
  "puducherry": "34",
  "andaman and nicobar islands": "35",
  "telangana": "36",
  "andhra pradesh": "37",
  "ladakh": "38",
};

/** Spellings that appear in real addresses but aren't the canonical state name. */
const STATE_ALIASES: Record<string, string> = {
  "new delhi": "delhi",
  "delhi ncr": "delhi",
  "nct of delhi": "delhi",
  "national capital territory of delhi": "delhi",
  "orissa": "odisha",
  "pondicherry": "puducherry",
  "uttaranchal": "uttarakhand",
  "j&k": "jammu and kashmir",
  "tamilnadu": "tamil nadu",
};

function normalizeState(state: string): string {
  const s = state.trim().toLowerCase().replace(/\s+/g, " ");
  return STATE_ALIASES[s] ?? s;
}

/** GST state code for a state name, or null if we don't recognise it. */
export function stateCode(state: string): string | null {
  return STATE_CODES[normalizeState(state)] ?? null;
}

/**
 * Intra-state supply (buyer in the seller's own state) is split CGST + SGST;
 * anything else is IGST. An unrecognised state is treated as inter-state —
 * charging IGST to a Delhi buyer over-collects nothing (the total is identical
 * either way, only the split differs), whereas the reverse mislabels a genuine
 * inter-state sale.
 */
export function isIntraState(buyerState: string): boolean {
  const code = stateCode(buyerState);
  return code !== null && code === SELLER.stateCode;
}

/** Round to 2 decimals without the usual floating-point 0.005 surprises. */
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface InvoiceLineInput {
  product_name: string;
  product_sku: string;
  hsn_code: string | null;
  quantity: number;
  /** Tax-inclusive unit price the customer agreed to. */
  selling_price: number;
}

export interface InvoiceLine {
  serial: number;
  name: string;
  sku: string;
  hsn: string;
  qty: number;
  /** Tax-inclusive unit price, as listed. */
  unitPrice: number;
  /** Share of the order-level discount carried by ONE unit of this line. */
  unitDiscount: number;
  /** Ex-GST value of the whole line after discount. */
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  /** Total tax on the line (cgst + sgst + igst). */
  tax: number;
  /** Inclusive line total actually paid — taxable + tax. */
  total: number;
}

export interface InvoiceTotals {
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  tax: number;
  /** Grand total including GST — equals the order's total_amount. */
  net: number;
}

export interface InvoiceComputation {
  intraState: boolean;
  rate: number;
  lines: InvoiceLine[];
  /** Delivery charge as its own inclusive line, or null when free. */
  shipping: Omit<InvoiceLine, "serial" | "name" | "sku" | "hsn" | "qty" | "unitPrice" | "unitDiscount"> | null;
  totals: InvoiceTotals;
}

/**
 * Split one tax-inclusive amount into its taxable value and GST components.
 * `inclusive` is the source of truth, so tax is derived as the remainder and
 * the two always add back to it exactly.
 */
function splitInclusive(inclusive: number, rate: number, intraState: boolean) {
  const taxable = round2(inclusive / (1 + rate / 100));
  const tax = round2(inclusive - taxable);

  if (!intraState) {
    return { taxable, cgst: 0, sgst: 0, igst: tax, tax };
  }
  // CGST and SGST are each half the tax. On an odd number of paise the halves
  // can't be equal — give the extra paisa to CGST so the pair still sums to
  // the total tax rather than leaving the invoice a paisa short.
  const sgst = round2(tax / 2);
  const cgst = round2(tax - sgst);
  return { taxable, cgst, sgst, igst: 0, tax };
}

/**
 * Build every printable number on the invoice from the stored order.
 *
 * Order-level money (coupon discount + any admin discount) is apportioned
 * across the lines in proportion to their value, because GST is charged per
 * line — a discount sitting only in the order total would leave the line tax
 * overstated. The last line absorbs the apportionment remainder so the
 * discounts distributed always sum back to the discount actually given.
 */
export function computeInvoice(params: {
  items: InvoiceLineInput[];
  /** Coupon discount on the order. */
  discountAmount: number;
  /** Extra discount an admin applied on top of the coupon. */
  adminDiscount: number;
  shippingCharge: number;
  buyerState: string;
  rate?: number;
}): InvoiceComputation {
  const rate = params.rate ?? GST_RATE;
  const intraState = isIntraState(params.buyerState);

  const grosses = params.items.map((i) => round2(i.selling_price * i.quantity));
  const grossTotal = grosses.reduce((a, b) => a + b, 0);

  // Never distribute more discount than there is value to discount against —
  // a data error upstream must not produce negative taxable values.
  const totalDiscount = Math.min(
    round2(Math.max(0, params.discountAmount) + Math.max(0, params.adminDiscount)),
    grossTotal
  );

  let distributed = 0;
  const lines: InvoiceLine[] = params.items.map((item, idx) => {
    const gross = grosses[idx];
    const isLast = idx === params.items.length - 1;

    // Pro-rata share of the discount, with the final line taking whatever is
    // left so the parts add up to totalDiscount exactly.
    const share = isLast
      ? round2(totalDiscount - distributed)
      : grossTotal > 0
      ? round2((totalDiscount * gross) / grossTotal)
      : 0;
    distributed = round2(distributed + share);

    const net = round2(gross - share);
    const split = splitInclusive(net, rate, intraState);

    return {
      serial: idx + 1,
      name: item.product_name,
      sku: item.product_sku,
      hsn: item.hsn_code?.trim() || "",
      qty: item.quantity,
      unitPrice: round2(item.selling_price),
      unitDiscount: item.quantity > 0 ? round2(share / item.quantity) : 0,
      ...split,
      total: net,
    };
  });

  // Delivery is a composite supply with the goods, so it carries the same rate
  // and is likewise inclusive — the customer pays the charge as quoted.
  const shippingCharge = round2(Math.max(0, params.shippingCharge));
  const shipping =
    shippingCharge > 0
      ? { ...splitInclusive(shippingCharge, rate, intraState), total: shippingCharge }
      : null;

  const sum = (pick: (l: InvoiceLine) => number) =>
    round2(lines.reduce((a, l) => a + pick(l), 0));

  const totals: InvoiceTotals = {
    taxable: round2(sum((l) => l.taxable) + (shipping?.taxable ?? 0)),
    cgst: round2(sum((l) => l.cgst) + (shipping?.cgst ?? 0)),
    sgst: round2(sum((l) => l.sgst) + (shipping?.sgst ?? 0)),
    igst: round2(sum((l) => l.igst) + (shipping?.igst ?? 0)),
    tax: round2(sum((l) => l.tax) + (shipping?.tax ?? 0)),
    net: round2(sum((l) => l.total) + (shipping?.total ?? 0)),
  };

  return { intraState, rate, lines, shipping, totals };
}
