import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service'; 
import { Firestore, Timestamp } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


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

  getAvaliacoesGlobaisPaginadas(ultimoDocumento: any = null): Observable<any> {
    let query = this.firestore
      .collection('reviews', ref => {
        let queryRef = ref.orderBy('timestamp', 'desc').limit(10);
        if (ultimoDocumento) {
          queryRef = queryRef.startAfter(ultimoDocumento);
        }
        return queryRef;
      })
      .snapshotChanges();

      return query.pipe(
        map(actions => {
          const avaliacoes = actions.map((a: any) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return {
              id,
              ...data,
              userId: data.userId,
            };
          });
      
          const avaliacoesComLivro = avaliacoes.map(avaliacao => ({
            ...avaliacao,
            livro: {
              titulo: avaliacao.livro?.volumeInfo?.title,
              autor: avaliacao.livro?.volumeInfo?.authors,
              capa: avaliacao.livro?.volumeInfo?.imageLinks?.thumbnail,
            }
          }));
      
          const ultimoDocumento = actions.length ? actions[actions.length - 1].payload.doc : null;
          return { avaliacoes: avaliacoesComLivro, ultimoDocumento };
        })
      );
    }
    
    async getAvaliacoesByUser(uid: string): Promise<any[]> {
      const avaliacoesSnapshot = await this.firestore
        .collection('avaliacoes', (ref) => ref.where('usuarioId', '==', uid))
        .get()
        .toPromise();
      
      return avaliacoesSnapshot?.docs.map((doc) => doc.data()) || [];
    }
    
  }      