import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AvaliacaoService } from '../services/avaliacao.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SeguidoresService } from '../services/seguidores.service'; 
import { NavController } from '@ionic/angular';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.page.html',
  styleUrls: ['./perfil-usuario.page.scss'],
})
export class PerfilUsuarioPage implements OnInit {
  usuario: any = null;
  avaliacoes: any[] = [];
  seguidores: number = 0;
  seguindo: boolean = false;
  livrosLidos: number = 0;
  estadoSegue: boolean = false;
  isLoading: boolean = true; 

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private avaliacaoService: AvaliacaoService,
    private firestore: AngularFirestore,
    private seguidoresService: SeguidoresService, 
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    const uid = this.route.snapshot.paramMap.get('uid');
    if (uid) {
      this.usuario = await this.authService.getUserData(uid);
      await this.carregarPerfil(uid);
      await this.carregarAvaliacoes(uid);
      await this.verificarSeSegue(uid);
      this.isLoading = false; 
    }
  }

  voltar() {
    this.navCtrl.back();
  }

 async carregarPerfil(uid: string) {
    this.firestore.collection('users').doc(uid).snapshotChanges().subscribe(doc => {
      if (doc.payload.exists) {
        const userData = doc.payload.data() as any;
        this.seguidores = userData?.seguidores || 0;
        this.livrosLidos = userData?.livrosLidos || 0;
        this.seguindo = userData?.seguindo || 0;  
      }
    });
  }
  

 async carregarAvaliacoes(uid: string) {
    return this.avaliacaoService.getAvaliacoesPorUsuario(uid).subscribe(avaliacoes => {
      this.avaliacoes = avaliacoes;
      this.livrosLidos = this.avaliacoes.length;
    });
  }

  async verificarSeSegue(uid: string) {
    const currentUserId = await this.authService.getCurrentUserId();
    if (currentUserId) {
      this.estadoSegue = await this.seguidoresService.usuarioSegue(uid, currentUserId);
    }
  }

  async seguirOuDeixarDeSeguir() {
    if (this.estadoSegue) {
      this.deixarDeSeguir();
    } else {
      this.seguirUsuario();
    }
  }  

  async seguirUsuario() {
    if (this.usuario) {
      const currentUserId = await this.authService.getCurrentUserId();
      if (!currentUserId) {
        console.error('Usuário não autenticado');
        return;
      }
  
      await this.seguidoresService.seguirUsuario(this.usuario.uid, currentUserId);
  
      this.estadoSegue = true;
      this.seguidores++; 
      this.carregarPerfil(this.usuario.uid); 
    }
  }
  
  async deixarDeSeguir() {
    if (this.usuario) {
      const currentUserId = await this.authService.getCurrentUserId();
      if (!currentUserId) {
        console.error('Usuário não autenticado');
        return;
      }
  
      await this.seguidoresService.deixarDeSeguirUsuario(this.usuario.uid, currentUserId);
  
      this.estadoSegue = false;
      this.seguidores--; 
      this.carregarPerfil(this.usuario.uid); 
    }
  }
}  