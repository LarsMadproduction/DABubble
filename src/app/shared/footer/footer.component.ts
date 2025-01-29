import { Component } from '@angular/core';
import { ImprintComponent } from "../imprint/imprint.component";
import { PrivacyPolicyComponent } from "../privacy-policy/privacy-policy.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

}
