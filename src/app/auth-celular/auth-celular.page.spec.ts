import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthCelularPage } from './auth-celular.page';

describe('AuthCelularPage', () => {
    let component: AuthCelularPage;
    let fixture: ComponentFixture<AuthCelularPage>;

    beforeEach(() => {
        fixture = TestBed.createComponent(AuthCelularPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
