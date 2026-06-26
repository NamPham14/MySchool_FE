import type { APIResponse, PageResponse } from "./common.type";

export interface FeeInvoiceResponse {
  id: number;
  title: string;
  semesterName: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
}

export interface FeeTransactionResponse {
  id: number;
  amount: number;
  paymentMethod: string;
  transactionDate: string;
  status: string;
}

export type FeeInvoicePageResponse = APIResponse<PageResponse<FeeInvoiceResponse>>;
export type FeeTransactionPageResponse = APIResponse<PageResponse<FeeTransactionResponse>>;
