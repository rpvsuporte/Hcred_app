import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChooseVerifyPage } from './choose-verify.page';

describe('ChooseVerifyPage', () => {
  let component: ChooseVerifyPage;
  let fixture: ComponentFixture<ChooseVerifyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseVerifyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
