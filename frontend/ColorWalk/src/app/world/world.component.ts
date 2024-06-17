import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { World } from './world.service';

@Component({
  selector: 'app-world',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './world.component.html',
  styleUrl: './world.component.css'
})
export class WorldComponent implements OnDestroy {
  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  public constructor(private world: World) {
  }

  public ngOnInit(): void {
    // this.world = new World();
    this.world.createScene(this.rendererCanvas);
    this.world.animate();
  }

  ngOnDestroy(): void {
    console.log("!");
    this.world.ngOnDestroy();
  }
}
