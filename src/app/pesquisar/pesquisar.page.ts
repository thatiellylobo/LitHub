import { Component } from '@angular/core';
import { GoogleBooksService } from '../services/google-books.service';

@Component({
  selector: 'app-pesquisar',
  templateUrl: './pesquisar.page.html',
  styleUrls: ['./pesquisar.page.scss'],
})
export class PesquisarPage {
  placeholder: string = 'Buscar livros, autores...';
  livros: any[] = [];
  searchQuery: string = '';
  livroSelecionado: any; 

  constructor(private googleBooksService: GoogleBooksService) {}

  updatePlaceholder(event: CustomEvent) {
    const value = event.detail.value;
    if (value === 'livros') {
      this.placeholder = 'Buscar livros, autores...';
    } else if (value === 'leitores') {
      this.placeholder = 'Buscar leitores';
    }
  }

  buscarLivros() {
    if (this.searchQuery.trim() !== '') {
      this.googleBooksService.buscarLivros(this.searchQuery).subscribe(data => {
        this.livros = data.items || [];
        this.livroSelecionado = null; // Reseta o livro selecionado ao buscar novos livros
      }, error => {
        console.error('Erro ao buscar livros:', error);
      });
    } else {
      this.limparBusca();
    }
  }

  // Método para mostrar detalhes do livro selecionado
  mostrarDetalhes(livro: any) {
    this.livroSelecionado = livro; // Define o livro selecionado
  }

  limparBusca() {
    this.searchQuery = '';
    this.livros = [];
    this.livroSelecionado = null; 
  }
}
