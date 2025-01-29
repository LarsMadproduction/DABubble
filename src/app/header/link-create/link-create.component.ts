import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-link-create',
  standalone: true,
  imports: [],
  templateUrl: './link-create.component.html',
  styleUrl: './link-create.component.scss',
})
export class LinkCreateComponent {
  constructor(private router: Router) {}

  /**
   * routes the user to 'register' to create a new account
   */
  openCreateAccount(): void {
    this.router.navigate(['/register']);
  }
}
