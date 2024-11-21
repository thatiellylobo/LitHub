import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service'; 
import { Firestore, Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})

export class AvaliacaoService {
  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
  ) {}

  async verificarResenhaExistente(userId: string, bookId: string): Promise<boolean> {
    const resenhaRef = this.firestore.collection('avaliacoes', ref =>
      ref.where('userId', '==', userId).where('bookId', '==', bookId)
    ).get();

    const snapshot = await resenhaRef.toPromise();
    return snapshot ? !snapshot.empty : false;  
  }


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



