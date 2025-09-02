import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimuladorPage } from './simulador.page';

describe('SimuladorPage', () => {
    let component: SimuladorPage;
    let fixture: ComponentFixture<SimuladorPage>;

    beforeEach(() => {
        fixture = TestBed.createComponent(SimuladorPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
