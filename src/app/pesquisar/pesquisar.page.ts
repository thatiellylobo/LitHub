import { Component } from '@angular/core';
import { GoogleBooksService } from '../services/google-books.service';
import { AuthService } from '../services/auth.service';  // Adicione a importação para o AuthService
import { AvaliacaoService } from '../services/avaliacao.service';

@Component({
  selector: 'app-pesquisar',
  templateUrl: './pesquisar.page.html',
  styleUrls: ['./pesquisar.page.scss'],
})
export class PesquisarPage {
  placeholder: string = 'Buscar livros, autores...';
  livros: any[] = [];
  leitores: any[] = [];  
  searchQuery: string = '';
  livroSelecionado: any;
  tipoBusca: string = 'livros'; 

  constructor(
    private googleBooksService: GoogleBooksService,
    private authService: AuthService,
    private avaliacaoService: AvaliacaoService 
  ) {}

  updatePlaceholder(event: CustomEvent) {
    const value = event.detail.value;
    if (value === 'livros') {
      this.placeholder = 'Buscar livros, autores...';
    } else if (value === 'leitores') {
      this.placeholder = 'Buscar leitores';
    }
    this.tipoBusca = value; 
    this.limparBusca(); 
  }

  buscar() {
    if (this.tipoBusca === 'livros') {
      this.buscarLivros();
    } else if (this.tipoBusca === 'leitores') {
      this.buscarLeitores();
    }
  }

  async buscarLivros() {
    if (this.searchQuery.trim() !== '') {
      this.googleBooksService.buscarLivros(this.searchQuery).subscribe(async (data) => {
        const user = await this.authService.getCurrentUser();
        if (user) {
          this.livros = await Promise.all(
            (data.items || []).map(async (livro: any) => {
              const resenhaExistente = await this.avaliacaoService.verificarResenhaExistente(user.uid, livro.id);
              return { ...livro, resenhaConfirmada: resenhaExistente };
            })
          );
        } else {
          this.livros = data.items || [];
        }
        this.livroSelecionado = null;
      }, error => {
        console.error('Erro ao buscar livros:', error);
      });
    } else {
      this.limparBusca();
    }
  }


  buscarLeitores() {
    if (this.searchQuery.trim() !== '') {
      this.authService.buscarLeitores(this.searchQuery).subscribe(data => {
        this.leitores = data; 
      }, error => {
        console.error('Erro ao buscar leitores:', error);
      });
    } else {
      this.limparBusca();
    }
  }

  limparBusca() {
    this.searchQuery = '';
    this.livros = [];
    this.leitores = [];
    this.livroSelecionado = null;
  }

  mostrarDetalhes(livro: any) {
    this.livroSelecionado = livro;
  }
  
}

