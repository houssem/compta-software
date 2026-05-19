// src/app/shared/models/client.model.ts

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
  currency: 'EUR' | 'GBP' | 'USD' | 'CHF'
  paymentTerms: 'Net 15' | 'Net 30' | 'Net 45' | 'Net 60' | 'Immédiat'
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
