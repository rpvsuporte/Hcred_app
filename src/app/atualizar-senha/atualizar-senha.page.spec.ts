import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AtualizarSenhaPage } from './atualizar-senha.page';

describe('AtualizarSenhaPage', () => {
    let component: AtualizarSenhaPage;
    let fixture: ComponentFixture<AtualizarSenhaPage>;

    beforeEach(() => {
        fixture = TestBed.createComponent(AtualizarSenhaPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
