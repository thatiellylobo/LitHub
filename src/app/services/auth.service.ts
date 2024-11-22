import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';

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
  user$: Observable<firebase.User | null>; // para o estado de autenticação

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    // Configurar persistência local
    this.afAuth.setPersistence('local').then(() => {
      console.log('Persistência configurada com sucesso');
    }).catch((error) => {
      console.error('Erro ao configurar persistência:', error);
    });

    // Observa o estado do usuário (login/logout)
    this.user$ = this.afAuth.authState;
  }

  async getCurrentUser() {
    return await this.afAuth.currentUser;
  }

  buscarLeitores(searchQuery: string) {
    return this.firestore
      .collection('users', (ref) =>
        ref
          .where('usuario', '>=', searchQuery)
          .where('usuario', '<=', searchQuery + '\uf8ff')
      )
      .valueChanges();
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
        seguidores: 0,
        seguindo: 0,
        livrosLidos: 0,
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

    await usuarioRef.update({
      seguidores: firebase.firestore.FieldValue.increment(1),
    });
    await seguidorRef.update({
      seguindo: firebase.firestore.FieldValue.increment(1),
    });
  }

  async deixarDeSeguirUsuario(usuarioId: string, seguidorId: string) {
    const usuarioRef = this.firestore.collection('users').doc(usuarioId);
    const seguidorRef = this.firestore.collection('users').doc(seguidorId);

    await usuarioRef.update({
      seguidores: firebase.firestore.FieldValue.increment(-1),
    });
    await seguidorRef.update({
      seguindo: firebase.firestore.FieldValue.increment(-1),
    });
  }

  async login(emailOrUsername: string, password: string) {
    try {
      console.log('Tentando login com:', emailOrUsername);
      let email: string | null = null;

      const userDoc = await this.firestore
        .collection('users', (ref) =>
          ref.where('usuario', '==', emailOrUsername)
        )
        .get()
        .toPromise();

      if (userDoc && !userDoc.empty) {
        const userData = userDoc.docs[0].data() as User;
        email = userData.email;
        console.log('Email encontrado para o usuário:', email);
      } else {
        email = emailOrUsername; 
      }

      if (email) {
        const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
        console.log('Login bem-sucedido:', userCredential.user);
        return userCredential.user;
      } else {
        throw new Error('Usuário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  async logout() {
    try {
      console.log('Realizando logout...');
      await this.afAuth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  }

  async recuperarSenha(email: string): Promise<void> {
    return this.afAuth.sendPasswordResetEmail(email); // para enviar e-mail de recuperação de senha
  }

  verificarEmailCadastrado(email: string) {
    return this.afAuth.fetchSignInMethodsForEmail(email);
  }

  async getCurrentUserId(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return user ? user.uid : null;
  }

  loginComGoogle() {
    const provider = new GoogleAuthProvider();

    return this.afAuth
      .signInWithPopup(provider)
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

  verificarEstadoDeLogin() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        console.log('Usuário autenticado:', user);
        this.router.navigate(['/tabs/home']); // Redirecionar para a tela inicial
      } else {
        console.log('Nenhum usuário autenticado.');
        this.router.navigate(['/login']); // Redirecionar para a tela de login
      }
    });
  }
}
