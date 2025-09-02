import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BancoPage } from './banco.page';

describe('BancoPage', () => {
    let component: BancoPage;
    let fixture: ComponentFixture<BancoPage>;

    beforeEach(() => {
        fixture = TestBed.createComponent(BancoPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
