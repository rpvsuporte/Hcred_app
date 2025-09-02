import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnexosPage } from './anexos.page';

describe('AnexosPage', () => {
    let component: AnexosPage;
    let fixture: ComponentFixture<AnexosPage>;

    beforeEach(() => {
        fixture = TestBed.createComponent(AnexosPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
