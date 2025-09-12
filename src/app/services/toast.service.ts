// src/app/services/toast.service.ts
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    constructor(private toastController: ToastController) { }

    /**
        * Exibe um toast
        * @param message Mensagem do toast
        * @param duration Duração em milissegundos (default 2000)
        * @param color Cor do toast ('primary', 'success', 'warning', 'danger', etc)
    */
    async show(message: string, duration: number = 2000, color: string = 'primary') {
        const toast = await this.toastController.create({
            message,
            duration,
            color,
            position: 'bottom',
            animated: true,
            icon: undefined 
        });
        await toast.present();
    }


    async success(message: string, duration: number = 2000) {
        return this.show(message, duration, 'success');
    }

    async error(message: string, duration: number = 2000) {
        return this.show(message, duration, 'danger');
    }

    async warning(message: string, duration: number = 2000) {
        return this.show(message, duration, 'warning');
    }

    async info(message: string, duration: number = 2000) {
        return this.show(message, duration, 'primary');
    }
}
