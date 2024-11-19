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
    this.carregarPerfil();
  }

  async carregarAvaliacoes() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.avaliacaoService.getAvaliacoesPorUsuario(user.uid).subscribe(avaliacoes => {
        this.avaliacoes = avaliacoes;
      });
    } else {
      console.error('Usuário não autenticado');
    }
  }

  async carregarPerfil() {
    const user = await this.authService.getCurrentUser();
  
    if (user) {
      const doc = await this.firestore.collection('users').doc(user.uid).get().toPromise();
      if (doc && doc.exists) {
        const userData = doc.data() as UserData;
        this.nome = userData?.nome || '';
        this.username = userData?.usuario || '';
        this.seguidores = userData?.seguidores || 0; 
        this.seguindo = userData?.seguindo || 0;
        this.livrosLidos = userData?.livrosLidos || 0;
        this.carregarAvaliacoes();
      } else {
        console.error('Documento não encontrado ou indefinido');
      }
    } else {
      console.error('Usuário não autenticado');
    }
  }

  
  async logout() {
    await this.authService.logout(); 
    this.nome = '';  
    this.username = ''; 
    this.router.navigate(['/login']); 
  }
}
