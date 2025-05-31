import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndScenarioDialogueComponent } from './end-scenario-dialogue.component';

describe('EndScenarioDialogueComponent', () => {
  let component: EndScenarioDialogueComponent;
  let fixture: ComponentFixture<EndScenarioDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndScenarioDialogueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndScenarioDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
