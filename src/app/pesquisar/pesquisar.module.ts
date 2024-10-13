import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PesquisarPage } from './pesquisar.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { PesquisarPageRoutingModule } from './pesquisar-routing.module'; 
import { DetalhesComponent } from '../detalhes/detalhes.component';

@NgModule({
  declarations: [PesquisarPage, DetalhesComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PesquisarPageRoutingModule, 
    ExploreContainerComponentModule,
  ],
})
export class PesquisarPageModule {}
