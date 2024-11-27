import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AvaliacaoModalComponent } from '../avaliacao-modal/avaliacao-modal.component';  
import { AvaliacaoService } from '../services/avaliacao.service';
import { AuthService } from '../services/auth.service'; 
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

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
  usuarioFoto: string | null = null;
  inicialUsuario: string = ''; 

  constructor(
    private avaliacaoService: AvaliacaoService, 
    private authService: AuthService,
    private router: Router,
    private firestore: AngularFirestore,
    private modalController: ModalController  
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
        const userData = doc.data() as any;
        this.nome = userData?.nome || '';
        this.username = userData?.usuario || '';
        this.seguidores = userData?.seguidores || 0; 
        this.seguindo = userData?.seguindo || 0;
        this.livrosLidos = userData?.livrosLidos || 0;
        this.usuarioFoto = userData?.foto || null; 
        this.gerarInicial();
        this.carregarAvaliacoes(uid);
      } else {
        console.error('Documento não encontrado ou indefinido');
      }
    });
  }

  carregarAvaliacoes(uid: string) {
    this.avaliacaoService.getAvaliacoesPorUsuario(uid).subscribe(avaliacoes => {
      this.avaliacoes = avaliacoes;
      this.livrosLidos = this.avaliacoes.length; 
    });
  }

  gerarInicial() {
    if (this.nome) {
      this.inicialUsuario = this.nome.charAt(0).toUpperCase(); 
    } else {
      this.inicialUsuario = '?';
    }
  }

  async logout() {
    await this.authService.logout(); 
    this.nome = '';  
    this.username = ''; 
    this.router.navigate(['/login']); 

    const menu = document.querySelector('ion-menu');
    if (menu) {
      (menu as any).close();
    }
  }

  abrirModalEdicao(avaliacao: any) {
    this.modalController.create({
      component: AvaliacaoModalComponent,
      componentProps: {
        livro: avaliacao.livro, 
        avaliacaoExistente: avaliacao  
      }
    }).then(modal => {
      modal.present();
    });
  }

  excluirAvaliacao(avaliacaoId: string) {
    this.firestore.collection('reviews').doc(avaliacaoId).delete().then(() => {
      console.log('Avaliação excluída com sucesso');
      this.authService.getCurrentUser().then(user => {
        if (user) {
          this.carregarAvaliacoes(user.uid); 
        }
      });
    }).catch(error => {
      console.error('Erro ao excluir avaliação:', error);
    });
  }
}
