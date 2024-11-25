import { Component, OnInit, OnDestroy } from '@angular/core';
import { AvaliacaoService } from '../services/avaliacao.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

interface Avaliacao {
  userId: string;
  nome: string;
  foto?: string | null; 
  livro: {
    titulo: string;
    autor: string;
    capa: string;
  };
  reviewText: string;
  rating: number;
  timestamp: any;
}


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  avaliacoes: Avaliacao[] = [];
  carregando: boolean = true;
  ultimoDocumento: any = null;
  carregandoMais: boolean = false;
  userId: string | null = null;
  private authSubscription: Subscription = new Subscription();

  constructor(
    private avaliacaoService: AvaliacaoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.carregarAvaliacoes(true);
      } else {
        this.avaliacoes = [];
        this.carregando = false;
      }
    });
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  carregarAvaliacoes(reset: boolean = false) {
    if (reset) {
      this.avaliacoes = [];
      this.ultimoDocumento = null;
    }
  
    this.carregandoMais = true;
  
    this.avaliacaoService
      .getAvaliacoesGlobaisPaginadas(this.ultimoDocumento)
      .subscribe({
        next: (res: { avaliacoes: Avaliacao[], ultimoDocumento: any }) => {
          const novasAvaliacoes = res.avaliacoes
            .filter((avaliacao: Avaliacao) =>
              !this.avaliacoes.some(a => a.userId === avaliacao.userId) && avaliacao.userId !== this.userId
            )
            .map(avaliacao => ({
              ...avaliacao,
              foto: avaliacao.foto || null 
            }));
  
          this.avaliacoes = [...this.avaliacoes, ...novasAvaliacoes];
          this.ultimoDocumento = res.ultimoDocumento;
          this.carregando = false;
          this.carregandoMais = false;
        },
        error: (erro) => {
          console.error('Erro ao carregar avaliações:', erro);
          this.carregando = false;
          this.carregandoMais = false;
        },
      });
  }
}  
