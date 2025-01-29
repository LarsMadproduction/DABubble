import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojiReactionComponent } from './emoji-reaction.component';

describe('EmojiReactionComponent', () => {
  let component: EmojiReactionComponent;
  let fixture: ComponentFixture<EmojiReactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmojiReactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmojiReactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
