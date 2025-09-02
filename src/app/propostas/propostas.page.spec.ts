import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropostasPage } from './propostas.page';

describe('PropostasPage', () => {
    let component: PropostasPage;
    let fixture: ComponentFixture<PropostasPage>;

    beforeEach(() => {
        fixture = TestBed.createComponent(PropostasPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
