import { Component, HostListener } from '@angular/core';
import { ProfileComponent } from './profile/profile.component';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { LinkCreateComponent } from './link-create/link-create.component';
import { NgClass } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { ChannelService } from '../services/channel.service';
import { UserService } from '../services/user.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ProfileComponent, SearchbarComponent, LinkCreateComponent, NgClass, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.keyframes.scss', './header.component.scss']
})

export class HeaderComponent {
  isLoginRoute: boolean = false;
  isNotLoggedInRoute: boolean = false;
  isHomeRoute: boolean = false;
  isMobile: boolean = false;
  animationPlayed: boolean = false;
  server: string = 'Devspace';

  constructor(private router: Router, public channelService: ChannelService, private userService: UserService, private messageService: MessageService) {
    this.ngOnInit();
  }


  /**
   * checks the size of the innerwidth of the window
   * 
   * @param width the inner width of the browser window
   */
  @HostListener('window:resize', ['$event.target.innerWidth'])
  handleResize(width: number) {
    if (width < 1300) {
      this.channelService.isSmallScreen = true;
    } else {
      this.channelService.isSmallScreen = false;
    }
    if (width < 769) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  /**
   * checks on which route the user currently is to display the correct header items and animations
   */
  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isHomeRoute = event.url.includes('/home');
        this.isLoginRoute = event.url === '/'
        this.isNotLoggedInRoute = ['/register', '/avatar', '/reset-password','/privacy-policy', '/imprint'].some(route => event.url.includes(route));
        if (typeof window !== "undefined") {
          if (window.innerWidth < 769) this.channelService.isSmallScreen = true;
          if (window.innerWidth < 769) this.isMobile = true;
        }
        setTimeout(() => this.animationPlayed = true, 3000);
      });
  }

  /**
   * opens back the startScreen in the header for mobile
   */
  backToServer() {
    this.channelService.isServer = true;
    this.channelService.channelChatId = '';
    this.userService.privMsgUserId = '';
    this.messageService.threadOpen = false;
  }
}