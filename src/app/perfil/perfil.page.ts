import { Component, OnInit } from '@angular/core';
import { AvaliacaoService } from '../services/avaliacao.service';
import { AuthService } from '../services/auth.service'; 
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

interface UserData {
  nome: string;
  usuario: string;
  seguidores: number;
  seguindo: number;
  livrosLidos: number; 
}

@Component({
  selector: 'app-perfil',
  templateUrl: 'perfil.page.html',
  styleUrls: ['perfil.page.scss']
})
export class PerfilPage implements OnInit {
  avaliacoes: any[] = [];
  nome: string = '';
  username: string = '';
  seguidores: number = 0; 
  seguindo: number = 0;
  livrosLidos: number = 0; 

  constructor(
    private avaliacaoService: AvaliacaoService, 
    private authService: AuthService,
    private router: Router,
    private firestore: AngularFirestore 
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.carregarPerfil(user.uid);
      } else {
        console.error('Usuário não autenticado');
        this.router.navigate(['/login']);
      }
    });
  }

  carregarPerfil(uid: string) {
    this.firestore.collection('users').doc(uid).get().toPromise().then(doc => {
      if (doc && doc.exists) {
        const userData = doc.data() as UserData;
        this.nome = userData?.nome || '';
        this.username = userData?.usuario || '';
        this.seguidores = userData?.seguidores || 0; 
        this.seguindo = userData?.seguindo || 0;
        this.livrosLidos = userData?.livrosLidos || 0;
        this.carregarAvaliacoes(uid);
      } else {
        console.error('Documento não encontrado ou indefinido');
      }
    });
  }

  carregarAvaliacoes(uid: string) {
    this.avaliacaoService.getAvaliacoesPorUsuario(uid).subscribe(avaliacoes => {
      this.avaliacoes = avaliacoes;
    });
  }

  async logout() {
    await this.authService.logout(); 
    this.nome = '';  
    this.username = ''; 
    this.router.navigate(['/login']); 
  }
}
