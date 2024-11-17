import { Component } from '@angular/core';
import { GoogleBooksService } from '../services/google-books.service';
import { AuthService } from '../services/auth.service';  // Adicione a importação para o AuthService

@Component({
  selector: 'app-pesquisar',
  templateUrl: './pesquisar.page.html',
  styleUrls: ['./pesquisar.page.scss'],
})
export class PesquisarPage {
  placeholder: string = 'Buscar livros, autores...';
  livros: any[] = [];
  leitores: any[] = [];  // Array para armazenar usuários
  searchQuery: string = '';
  livroSelecionado: any;
  tipoBusca: string = 'livros';  // Definido inicialmente como 'livros'

  constructor(
    private googleBooksService: GoogleBooksService,
    private authService: AuthService  // Injete o serviço de autenticação
  ) {}

  updatePlaceholder(event: CustomEvent) {
    const value = event.detail.value;
    if (value === 'livros') {
      this.placeholder = 'Buscar livros, autores...';
    } else if (value === 'leitores') {
      this.placeholder = 'Buscar leitores';
    }
    this.tipoBusca = value;  // Atualiza o tipo de busca
    this.limparBusca();  // Limpa os resultados anteriores
  }

  buscar() {
    if (this.tipoBusca === 'livros') {
      this.buscarLivros();
    } else if (this.tipoBusca === 'leitores') {
      this.buscarLeitores();
    }
  }

  // Método para buscar livros
  buscarLivros() {
    if (this.searchQuery.trim() !== '') {
      this.googleBooksService.buscarLivros(this.searchQuery).subscribe(data => {
        this.livros = data.items || [];
        this.livroSelecionado = null;  // Reseta o livro selecionado
      }, error => {
        console.error('Erro ao buscar livros:', error);
      });
    } else {
      this.limparBusca();
    }
  }

  // Método para buscar leitores (usuários)
  buscarLeitores() {
    if (this.searchQuery.trim() !== '') {
      this.authService.buscarLeitores(this.searchQuery).subscribe(data => {
        this.leitores = data;  // Atualiza o array de leitores
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
