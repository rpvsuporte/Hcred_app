import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AtuarPropostaPage } from './atuar-proposta.page';

describe('AtuarPropostaPage', () => {
    let component: AtuarPropostaPage;
    let fixture: ComponentFixture<AtuarPropostaPage>;

    beforeEach(() => {
        fixture = TestBed.createComponent(AtuarPropostaPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
