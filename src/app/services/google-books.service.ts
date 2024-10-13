import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleBooksService {
  private apiUrl = 'https://www.googleapis.com/books/v1/volumes';

  constructor(private http: HttpClient) {}

  buscarLivros(query: string): Observable<any> {
    const url = `${this.apiUrl}?q=${query}`;
    return this.http.get<any>(url);
  }

  getLivrosPorAutor(autor: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?q=inauthor:${encodeURIComponent(autor)}&maxResults=6`);
  }
}