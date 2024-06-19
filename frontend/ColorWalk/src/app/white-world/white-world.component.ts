import { HostListener, Component, ElementRef, NgModule, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { WhiteWorld } from './white-world.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ColorService } from '../color.service';

@Component({
  selector: 'app-white-world',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './white-world.component.html',
  styleUrl: './white-world.component.css'
})
export class WhiteWorldComponent {
  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;
  newMessage: string = '';
  msgTarget: string = '/all';
  messageWrapperHeight: string = '50px';
  public constructor(public whiteWorld: WhiteWorld, private colorService: ColorService) {
  }

  public ngOnInit(): void {
    this.whiteWorld.createScene(this.rendererCanvas);
    this.whiteWorld.animate();
    this.colorService.currentColor.subscribe(color => {
      if (color) {
        this.whiteWorld.setSavedColor(color);
      }
    });
  }

  public coloration(event: MouseEvent): void {
    this.whiteWorld.coloration(event);
  }

  public sendMessage(): void {
    this.whiteWorld.sendMessage(this.msgTarget, this.newMessage);
    this.msgTarget = '/all';
    this.newMessage = ''
  }

  expandMessageWrapper(event: Event): void {
    event.stopPropagation();
    this.messageWrapperHeight = '300px'
  }

  @HostListener('document:click', ['$event'])
  shrinkMessageWrapper(event: Event): void {
    this.messageWrapperHeight = '50px'
  }
}