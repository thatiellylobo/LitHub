import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AvaliacaoService } from '../services/avaliacao.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';

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


  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private avaliacaoService: AvaliacaoService,
    private firestore: AngularFirestore,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    const uid = this.route.snapshot.paramMap.get('uid');
    if (uid) {
      this.usuario = await this.authService.getUserData(uid);
      this.carregarPerfil(uid);
      this.carregarAvaliacoes(uid);
    }
  }

  voltar() {
    this.navCtrl.back();
  }

  carregarPerfil(uid: string) {
    this.firestore.collection('users').doc(uid).get().toPromise().then(doc => {
      if (doc?.exists) {
        const userData = doc.data() as any;
        this.seguidores = userData?.seguidores || 0;
        this.seguindo = userData?.seguindo || 0;
        this.livrosLidos = userData?.livrosLidos || 0;
      }
      
    });
  }

  carregarAvaliacoes(uid: string) {
    this.avaliacaoService.getAvaliacoesPorUsuario(uid).subscribe(avaliacoes => {
      this.avaliacoes = avaliacoes;
      this.livrosLidos = this.avaliacoes.length;
    });
  }

  abrirModalEdicao(avaliacao: any) {
    // Lógica para abrir o modal de edição da avaliação
  }

  async seguirUsuario() {
    if (this.usuario) {
      const currentUserId = await this.authService.getCurrentUserId();
      if (!currentUserId) {
        console.error('Usuário não autenticado');
        return;
      }
      await this.authService.seguirUsuario(this.usuario.uid, currentUserId);
      this.seguindo = true;
    }
  }

  async deixarDeSeguir() {
    if (this.usuario) {
      const currentUserId = await this.authService.getCurrentUserId();
      if (!currentUserId) {
        console.error('Usuário não autenticado');
        return;
      }
      await this.authService.deixarDeSeguirUsuario(this.usuario.uid, currentUserId);
      this.seguindo = false;
    }
  }

  async verificarSeSegue(uid: string) {
    const currentUserId = await this.authService.getCurrentUserId();
    if (currentUserId) {
      this.seguindo = await this.authService.isFollowing(uid, currentUserId);
    }
  }  
}


