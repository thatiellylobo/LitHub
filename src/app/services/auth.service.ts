import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router'; 

interface User {
  uid: string;
  nome: string;
  usuario: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router 
  ) {}

  async getCurrentUser() {
    return await this.afAuth.currentUser; 
  }

  async register(email: string, password: string, usuario: string, nome: string) {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      console.log('Usuário cadastrado:', user);

      // Salvar informações do usuário no Firestore
      await this.firestore.collection('users').doc(user?.uid).set({
        uid: user?.uid,
        nome: nome,
        usuario: usuario,
        email: email,
      });

      this.router.navigate(['/login']); 

      return user;
    } catch (error) {
      console.error('Erro ao cadastrar: ', error);
      throw error;
    }
  }

  async login(emailOrUsername: string, password: string) {
    try {
      let email: string | null = null;
  
      const userDoc = await this.firestore
        .collection('users', ref => ref.where('usuario', '==', emailOrUsername))
        .get()
        .toPromise();
  
      if (userDoc && !userDoc.empty) {
        const userData = userDoc.docs[0].data() as User; 
        email = userData.email;
      } else {
        email = emailOrUsername;
      }
  
      if (email) {
        const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
  
        return userCredential.user;
      } else {
        throw new Error('Usuário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao fazer login: ', error);
      throw error;
    }
  }

 // auth.service.ts
async logout() {
  try {
    await this.afAuth.signOut();
    console.log('Usuário deslogado com sucesso.');

    // Redirecionar para a tela de login
    this.router.navigate(['/login']);
  } catch (error) {
    console.error('Erro ao deslogar: ', error);
    throw error;
  }
}
}
  