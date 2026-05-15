export interface Invoice {
  id: string
  number: string
  clientName: string
  amountHT: number
  status: 'emise' | 'payee' | 'en_attente' | 'en_retard'
  createdAt: Date
  dueDate: Date
}
