import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthEmailPage } from './auth-email.page';

describe('AuthEmailPage', () => {
  let component: AuthEmailPage;
  let fixture: ComponentFixture<AuthEmailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthEmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
