import { Component } from '@angular/core';
import { SideNavBarComponent } from './side-nav-bar/side-nav-bar.component';
import { SearchbarComponent } from '../header/searchbar/searchbar.component';
import { CreateChannelComponent } from './side-nav-bar/create-channel/create-channel.component';
import { ChannelService } from '../services/channel.service';


@Component({
  selector: 'app-slide-side-bar',
  standalone: true,
  imports: [SideNavBarComponent, SearchbarComponent, CreateChannelComponent],
  templateUrl: './slide-side-bar.component.html',
  styleUrl: './slide-side-bar.component.scss'
})
export class SlideSideBarComponent {

  constructor(public channelService: ChannelService) {
    const savedState = localStorage.getItem('slideOutNavBar');
    this.channelService.slideOutNavBar = savedState ? JSON.parse(savedState) : false;
  }

  /**
   * toggles the sideBar in and out of the screen and saves it to local storage
   */
  toggleSideBar() {
    this.channelService.slideOutNavBar = !this.channelService.slideOutNavBar;
    localStorage.setItem('slideOutNavBar', JSON.stringify(this.channelService.slideOutNavBar));
  }
}
