import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PerfilPage } from './perfil.page';
import { PerfilPageRoutingModule } from './perfil-routing.module'; 

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilPageRoutingModule 
  ],
  declarations: [PerfilPage]
})
export class PerfilPageModule {}
