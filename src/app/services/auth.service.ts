import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router'; 
import { GoogleAuthProvider } from 'firebase/auth';
import firebase from 'firebase/compat/app';

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

  buscarLeitores(searchQuery: string) {
    return this.firestore.collection('users', ref => 
      ref.where('usuario', '>=', searchQuery)
         .where('usuario', '<=', searchQuery + '\uf8ff') 
    ).valueChanges();
  }

  async register(email: string, password: string, usuario: string, nome: string) {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
  
      console.log('Usuário cadastrado:', user);
  
      // Salvar informações do usuário no Firestore
      await this.firestore.collection('users').doc(user?.uid).set({
        uid: user?.uid,
        nome: nome,
        usuario: usuario,
        email: email,
        seguidores: 0, 
        seguindo: 0     
      });
  
      this.router.navigate(['/login']); 
      return user;
    } catch (error) {
      console.error('Erro ao cadastrar: ', error);
      throw error;
    }
  }  

  async seguirUsuario(usuarioId: string, seguidorId: string) {
    const usuarioRef = this.firestore.collection('users').doc(usuarioId);
    const seguidorRef = this.firestore.collection('users').doc(seguidorId);
  
    await usuarioRef.update({ seguidores: firebase.firestore.FieldValue.increment(1) });
    await seguidorRef.update({ seguindo: firebase.firestore.FieldValue.increment(1) });

  }
  
  async deixarDeSeguirUsuario(usuarioId: string, seguidorId: string) {
    const usuarioRef = this.firestore.collection('users').doc(usuarioId);
    const seguidorRef = this.firestore.collection('users').doc(seguidorId);
  
   await usuarioRef.update({ seguidores: firebase.firestore.FieldValue.increment(-1) });
   await seguidorRef.update({ seguindo: firebase.firestore.FieldValue.increment(-1) });

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

async logout() {
  try {
    await this.afAuth.signOut();
    console.log('Usuário deslogado com sucesso.');

    // redirecionar para a tela de login
    this.router.navigate(['/login']);
  } catch (error) {
    console.error('Erro ao deslogar: ', error);
    throw error;
  }
}
async recuperarSenha(email: string): Promise<void> {
  return this.afAuth.sendPasswordResetEmail(email); // para enviar e-mail de recuperação de senha
}

 verificarEmailCadastrado(email: string) {
  return this.afAuth.fetchSignInMethodsForEmail(email);
}

loginComGoogle() {
  const provider = new GoogleAuthProvider();

  return this.afAuth.signInWithPopup(provider)
    .then((result) => {
      console.log('Login com Google bem-sucedido!', result);
      
      if (result.user) {
        console.log('Usuário autenticado, redirecionando...');
        this.router.navigate(['/tabs/home']);
      } else {
        console.log('Usuário não autenticado.');
      }
    })
    .catch((error) => {
      console.error('Erro no login com Google:', error);
    });
}
}
  