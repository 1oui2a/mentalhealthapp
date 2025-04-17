import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoodPage } from './mood.page';

describe('MoodPage', () => {
  let component: MoodPage;
  let fixture: ComponentFixture<MoodPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MoodPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
