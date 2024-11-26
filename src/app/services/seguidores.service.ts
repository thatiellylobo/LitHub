import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from './auth.service'; 
import firebase from 'firebase/compat/app'; 

@Injectable({
  providedIn: 'root'
})
export class SeguidoresService {

  constructor(
    private firestore: AngularFirestore, 
    private authService: AuthService
  ) {}


  seguirUsuario(usuarioSeguindoId: string, currentUserId: string): Promise<void> {
    const usuarioLogadoRef = this.firestore.collection('users').doc(currentUserId).collection('seguindoUsuarios').doc(usuarioSeguindoId);
    const usuarioSeguindoRef = this.firestore.collection('users').doc(usuarioSeguindoId);
    const usuarioLogado = this.firestore.collection('users').doc(currentUserId);

    usuarioLogado.update({
      seguindo: firebase.firestore.FieldValue.increment(1) 
    });

    return usuarioSeguindoRef.update({
      seguidores: firebase.firestore.FieldValue.increment(1) 
    }).then(() => {
      return usuarioLogadoRef.set({
        uid: usuarioSeguindoId,
        seguidoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
  }

  deixarDeSeguirUsuario(usuarioSeguindoId: string, currentUserId: string): Promise<void> {
    const usuarioLogadoRef = this.firestore.collection('users').doc(currentUserId).collection('seguindoUsuarios').doc(usuarioSeguindoId);
    const usuarioSeguindoRef = this.firestore.collection('users').doc(usuarioSeguindoId);
    const usuarioLogado = this.firestore.collection('users').doc(currentUserId);

    usuarioLogado.update({
      seguindo: firebase.firestore.FieldValue.increment(-1) 
    });

    return usuarioSeguindoRef.update({
      seguidores: firebase.firestore.FieldValue.increment(-1) 
    }).then(() => {
      return usuarioLogadoRef.delete();
    });
  }

async usuarioSegue(usuarioSeguindoId: string, currentUserId: string): Promise<boolean> {
    const usuarioSeguindoRef = await this.firestore
      .collection('users')
      .doc(currentUserId)
      .collection('seguindoUsuarios')
      .doc(usuarioSeguindoId)
      .get()
      .toPromise();
      
    return usuarioSeguindoRef?.exists ?? false; 
  }
}  