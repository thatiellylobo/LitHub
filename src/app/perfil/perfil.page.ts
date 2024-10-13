import { Component, OnInit } from '@angular/core';
import { AvaliacaoService } from '../services/avaliacao.service';
import { AuthService } from '../services/auth.service'; 

@Component({
  selector: 'app-perfil',
  templateUrl: 'perfil.page.html',
  styleUrls: ['perfil.page.scss']
})
export class PerfilPage implements OnInit {
  avaliacoes: any[] = [];

  constructor(
    private avaliacaoService: AvaliacaoService, 
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.carregarAvaliacoes();
  }

  carregarAvaliacoes() {
    this.avaliacaoService.getAvaliacoes().subscribe(avaliacoes => {
      this.avaliacoes = avaliacoes;
    });
  }
}
