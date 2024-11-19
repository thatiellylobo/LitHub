import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service'; 
import { Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})

export class AvaliacaoService {
  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
  ) {}

  adicionarAvaliacao(reviewData: { userId: string, bookId: string, rating: number, reviewText: string, timestamp: Date }) {
    return this.firestore.collection('reviews').add(reviewData)
      .then(() => console.log('Avaliação salva com sucesso!'))
      .catch(error => console.error('Erro ao salvar avaliação: ', error));
  }

  getAvaliacoesPorUsuario(userId: string) {
    return this.firestore.collection('reviews', ref =>
      ref
        .where('userId', '==', userId) 
        .orderBy('timestamp', 'desc') 
    ).valueChanges({ idField: 'id' }); 
  }
  

  getAvaliacoesPorLivro(bookId: string) {
    return this.firestore.collection('reviews', ref => ref.where('bookId', '==', bookId)).valueChanges();
  }
}

