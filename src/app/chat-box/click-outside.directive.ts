import { Directive, Output, EventEmitter, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  @Input() excludeElements: HTMLElement[] = [];
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  public onClick(target: HTMLElement) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    const clickedExcluded = this.excludeElements.some(el => el.contains(target));
    if (!clickedInside && !clickedExcluded) {
      this.clickOutside.emit();
    }
  }
}

