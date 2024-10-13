import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Avaliacao {
  livro: any;
  nota: number;
  resenha: string;
}

@Injectable({
  providedIn: 'root',
})
export class AvaliacaoService {
  private avaliacoes: Avaliacao[] = [];
  private avaliacoesSubject = new BehaviorSubject<Avaliacao[]>(this.avaliacoes);

  getAvaliacoes() {
    return this.avaliacoesSubject.asObservable();
  }

  adicionarAvaliacao(avaliacao: Avaliacao) {
    this.avaliacoes.push(avaliacao);
    this.avaliacoesSubject.next(this.avaliacoes);
  }
}
