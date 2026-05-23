export type PurchaseInvoiceStatus = 'reçue' | 'validée' | 'payée' | 'en retard'

export interface LineItem {
  id: number
  description: string
  qty: number
  priceHT: number
  discPct: number
  vatPct: number
}

export interface ApiPurchaseInvoice {
  id: number | string
  supplierName: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  currency: string
  totalTTC: number
  status: PurchaseInvoiceStatus
  createdAt: string
}

export interface StoredPurchaseInvoice {
  id: number | string
  supplierId: string
  supplierName: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  currency: string
  lineItems: LineItem[]
  internalNotes: string
  status: PurchaseInvoiceStatus
}

export interface CreatePurchaseInvoicePayload {
  supplierId: string
  supplierName: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  currency: string
  lineItems: LineItem[]
  internalNotes: string
  totalHT: number
  totalTTC: number
  status: PurchaseInvoiceStatus
  createdAt: string
}
