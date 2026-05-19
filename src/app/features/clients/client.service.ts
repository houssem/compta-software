import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Client, CreateClientDto } from '../../shared/models/client.model'

@Injectable({ providedIn: 'root' })
export class ClientService {
  constructor(private http: HttpClient) {}

  create(dto: CreateClientDto): Observable<Client> {
    return this.http.post<Client>('/api/clients', dto)
  }
}
