import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
}

}
