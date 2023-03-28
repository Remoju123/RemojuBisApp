import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { defaultUrlMatcher } from '@angular/router';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss'],
})
export class SampleComponent implements OnInit, AfterViewInit {
  @ViewChild('container') Container: ElementRef;
  constructor() {}

  ngAfterViewInit(): void {
    let Container = gsap.utils.selector(this.Container.nativeElement);
    let top = Container('.section.top');
    let logo = Container('.logo');
    let caption = Container('.caption');
    let arrows = Container('.arrows');
    let step1 = Container('.step1');

    gsap.set(top, {
      backgroundColor: '#B39C82',
    });
    gsap.set([logo, caption], {
      //autoAlpha: 0,
      //color: '#ffffff',
    });

    const tl0 = gsap.timeline();
    tl0.to(top, {
      backgroundColor: '#fff',
      delay: 0.8,
      duration: 1,
    });
    tl0.from(logo, {
      autoAlpha: 0,
      duration: 2,
    }),
      '+=1';
    tl0.to(logo, {
      autoAlpha: 0,
      duration: 0.5,
    });
    tl0.from(
      caption,
      {
        y: 300,
        autoAlpha: 0,
        duration: 1,
      },
      '-=0.5'
    );
    tl0.from(arrows, {
      autoAlpha: 0,
      y: 0,
      duration: 1,
    });

    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: step1,
        start: 'top top',
        end: 'bottom center',
        scrub: true,
        pin: true,
        //markers: true,
      },
    });

    let step1mark = Container('.step1-mark');
    let s1h1 = Container('.step1 > .head > h1');
    let s1p = Container('.step1 > .head > p');
    let s1bg = Container('.step1 > .screen > .bg');
    let s1b1 = Container('.step1 > .screen > .b1');

    tl1.from(step1mark, {
      opacity: 0,
      x: 0,
      duration: 1,
    });
    tl1.from([s1h1, s1p, s1bg], {
      opacity: 0,
      duration: 1,
    });
    tl1.from(s1b1, {
      x: -300,
      duration: 1,
    });
  }

  ngOnInit() {}
}
