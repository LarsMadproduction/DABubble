import { Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ChannelService } from '../../services/channel.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {

  constructor(
    private channelService: ChannelService,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {}

  transform(value: string): SafeHtml {
    if (!value) return value;
    const mentionPattern = /(@[\p{L}\w]+(?:\s[\p{L}\w]+)?|#[\p{L}\w]+(?:\s[\p{L}\w]+)?)/gu;
    const transformed = value.replace(mentionPattern, (match) => {
      const mention = match.slice(1);
      let isValid = false;
      if (match.startsWith('@')) {
        isValid = this.userService.isValidUser(mention); 
      } else if (match.startsWith('#')) {
        isValid = this.channelService.isValidChannel(mention); 
      }
      return isValid ? `<span class="highlighted" data-mention="${match}">${match}</span>` : match;
    });

    return this.sanitizer.bypassSecurityTrustHtml(transformed);
  }
}