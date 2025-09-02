import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {

    constructor(private navCtrl: NavController) {}

    navigate(page: string, estatus?: string, idProposta?: string) {
        if (page === 'propostas' && estatus !== undefined) {
            localStorage.setItem('estatus', estatus);
        } else if(page === 'propostas/atuar-proposta' && idProposta !== undefined){
            localStorage.setItem('idProposta', idProposta);
        }
        this.navCtrl.navigateRoot(page);
    }
}
