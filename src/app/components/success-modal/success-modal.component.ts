import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-success-modal',
    templateUrl: './success-modal.component.html',
    styleUrls: ['./success-modal.component.scss'],
    standalone: false
})
export class SuccessModalComponent implements OnInit {

    constructor(private modalCtrl: ModalController) { }

    ngOnInit() {}

    // Fechar o modal

    fecharModal() {
        this.modalCtrl.dismiss();
    }
}