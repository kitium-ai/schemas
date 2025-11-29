/**
 * Payment and invoice schema for managing billing
 */

import { z } from 'zod';
import { UUID, Timestamps, PaymentStatus, Address } from '../../types/common';

/**
 * Payment interface definitions
 */
export interface PaymentMethod extends Timestamps {
  id: UUID;
  organizationId: UUID;
  type: 'card' | 'bank_account' | 'wallet';
  name: string;
  isDefault: boolean;
  status: 'active' | 'inactive' | 'expired';
  cardDetails?: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    routingNumber: string;
  };
  metadata?: Record<string, unknown>;
}

export interface Invoice extends Timestamps {
  id: UUID;
  organizationId: UUID;
  subscriptionId?: UUID;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'refunded' | 'cancelled';
  amount: number;
  currency: string;
  dueDate: Date;
  issuedDate: Date;
  paidAt?: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  notes?: string;
  pdf_url?: string;
  metadata?: Record<string, unknown>;
}

export interface InvoiceItem {
  id?: UUID;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
}

export interface Payment extends Timestamps {
  id: UUID;
  organizationId: UUID;
  invoiceId?: UUID;
  subscriptionId?: UUID;
  paymentMethodId: UUID;
  amount: number;
  currency: string;
  status: (typeof PaymentStatus)[keyof typeof PaymentStatus];
  externalTransactionId?: string;
  failureReason?: string;
  processedAt?: Date;
  refundedAt?: Date;
  refundedAmount?: number;
  receipt_url?: string;
  metadata?: Record<string, unknown>;
}

export interface Refund extends Timestamps {
  id: UUID;
  paymentId: UUID;
  organizationId: UUID;
  amount: number;
  reason: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  processedAt?: Date;
  externalRefundId?: string;
  metadata?: Record<string, unknown>;
}

export interface BillingInfo extends Timestamps {
  id: UUID;
  organizationId: UUID;
  company?: string;
  address: Address;
  taxId?: string;
  billingEmail: string;
  billingName: string;
}

export interface CreatePaymentInput {
  invoiceId?: UUID;
  subscriptionId?: UUID;
  paymentMethodId: UUID;
  amount: number;
}

export interface CreateInvoiceInput {
  subscriptionId?: UUID;
  items: InvoiceItem[];
  dueDate: Date;
  notes?: string;
  discountPercent?: number;
}

export interface UpdateInvoiceInput {
  status?: 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'refunded' | 'cancelled';
  notes?: string;
  items?: InvoiceItem[];
  dueDate?: Date;
}

export interface CreateRefundInput {
  paymentId: UUID;
  amount?: number;
  reason: string;
}

export interface AddPaymentMethodInput {
  type: 'card' | 'bank_account' | 'wallet';
  name: string;
  isDefault?: boolean;
  cardDetails?: {
    number: string;
    cvv: string;
    expiryMonth: number;
    expiryYear: number;
    holderName: string;
  };
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    routingNumber: string;
  };
}

/**
 * Zod validation schemas
 */
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

const InvoiceItemSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  amount: z.number().min(0),
  taxRate: z.number().min(0).max(100).optional(),
});

export const PaymentMethodSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  type: z.enum(['card', 'bank_account', 'wallet']),
  name: z.string().min(1),
  isDefault: z.boolean(),
  status: z.enum(['active', 'inactive', 'expired']),
  cardDetails: z
    .object({
      brand: z.string(),
      last4: z.string(),
      expiryMonth: z.number().min(1).max(12),
      expiryYear: z.number().positive(),
    })
    .optional(),
  bankDetails: z
    .object({
      accountName: z.string(),
      accountNumber: z.string(),
      routingNumber: z.string(),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  subscriptionId: z.string().uuid().optional(),
  invoiceNumber: z.string(),
  status: z.enum(['draft', 'sent', 'viewed', 'partially_paid', 'paid', 'refunded', 'cancelled']),
  amount: z.number(),
  currency: z.string(),
  dueDate: z.date(),
  issuedDate: z.date(),
  paidAt: z.date().optional(),
  items: z.array(InvoiceItemSchema),
  subtotal: z.number(),
  tax: z.number(),
  discount: z.number().optional(),
  total: z.number(),
  notes: z.string().optional(),
  pdf_url: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateInvoiceSchema = z.object({
  subscriptionId: z.string().uuid().optional(),
  items: z.array(InvoiceItemSchema).min(1),
  dueDate: z.date(),
  notes: z.string().max(1000).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
});

export const UpdateInvoiceSchema = z.object({
  status: z
    .enum(['draft', 'sent', 'viewed', 'partially_paid', 'paid', 'refunded', 'cancelled'])
    .optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(InvoiceItemSchema).optional(),
  dueDate: z.date().optional(),
});

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  invoiceId: z.string().uuid().optional(),
  subscriptionId: z.string().uuid().optional(),
  paymentMethodId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded', 'cancelled']),
  externalTransactionId: z.string().optional(),
  failureReason: z.string().optional(),
  processedAt: z.date().optional(),
  refundedAt: z.date().optional(),
  refundedAmount: z.number().optional(),
  receipt_url: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreatePaymentSchema = z.object({
  invoiceId: z.string().uuid().optional(),
  subscriptionId: z.string().uuid().optional(),
  paymentMethodId: z.string().uuid('Invalid payment method ID'),
  amount: z.number().positive('Amount must be greater than 0'),
});

export const RefundSchema = z.object({
  id: z.string().uuid(),
  paymentId: z.string().uuid(),
  organizationId: z.string().uuid(),
  amount: z.number(),
  reason: z.string(),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']),
  processedAt: z.date().optional(),
  externalRefundId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateRefundSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
  amount: z.number().positive().optional(),
  reason: z.string().min(1, 'Refund reason is required').max(500),
});

export const BillingInfoSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  company: z.string().optional(),
  address: AddressSchema,
  taxId: z.string().optional(),
  billingEmail: z.string().email(),
  billingName: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AddPaymentMethodSchema = z.object({
  type: z.enum(['card', 'bank_account', 'wallet']),
  name: z.string().min(1, 'Payment method name is required'),
  isDefault: z.boolean().optional(),
  cardDetails: z
    .object({
      number: z.string().regex(/^\d{13,19}$/, 'Invalid card number'),
      cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
      expiryMonth: z.number().min(1).max(12),
      expiryYear: z.number().positive(),
      holderName: z.string().min(1),
    })
    .optional(),
  bankDetails: z
    .object({
      accountName: z.string().min(1),
      accountNumber: z.string().min(1),
      routingNumber: z.string().min(1),
    })
    .optional(),
});

export type ValidatedPaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type ValidatedInvoice = z.infer<typeof InvoiceSchema>;
export type ValidatedCreateInvoice = z.infer<typeof CreateInvoiceSchema>;
export type ValidatedUpdateInvoice = z.infer<typeof UpdateInvoiceSchema>;
export type ValidatedPayment = z.infer<typeof PaymentSchema>;
export type ValidatedCreatePayment = z.infer<typeof CreatePaymentSchema>;
export type ValidatedRefund = z.infer<typeof RefundSchema>;
export type ValidatedCreateRefund = z.infer<typeof CreateRefundSchema>;
export type ValidatedBillingInfo = z.infer<typeof BillingInfoSchema>;
export type ValidatedAddPaymentMethod = z.infer<typeof AddPaymentMethodSchema>;
