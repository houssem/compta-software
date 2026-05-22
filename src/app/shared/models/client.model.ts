// src/app/shared/models/client.model.ts

export interface Country {
  id: number
  value: string
  label: string
}

export interface Currency {
  id: number
  value: string
  label: string
  symbol: string
}

export interface PaymentTerm {
  id: number
  value: string
  label: string
  days: number
}

export interface ClientContact {
  fullName: string
  email: string
  phone: string
}

export interface ClientAddress {
  street: string
  city: string
  postalCode: string
  country: string
}

export interface ClientFinancial {
  taxId: string
  currency: string
  paymentTerms: string
}

export interface CreateClientDto {
  companyName: string
  website: string
  contact: ClientContact
  billingAddress: ClientAddress
  financial: ClientFinancial
}

export interface Client extends CreateClientDto {
  id: string
  reference: string
  createdAt: string
}
