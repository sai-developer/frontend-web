import { Component, OnInit, HostListener, Injectable } from '@angular/core';

@Injectable()
@Component({
  selector: 'app-scroll-highlight',
  templateUrl: './scroll-highlight.component.html',
  styleUrls: ['./scroll-highlight.component.scss']
})
export class ScrollHighlightComponent implements OnInit {

  lastScrollTop = 0;
  st = 0;
  client: any;
  clients: any;
  height: any;
  height1: any;


  constructor() { }

  @HostListener('window:scroll', ['$event'])

  ngOnInit() {
  }

  onWindowScroll(e) {
    // in order to hide the header part on scrolling, this function is used.
    let element = document.getElementById('staff');
    let element1 = document.getElementById('staffHeader');
    this.st = e.target.scrollTop;
    let ch = e.target.clientHeight;
    console.log(e.target.scrollHeight);
    if(this.st !==0 && Math.round(this.st + ch) !== e.target.scrollHeight) {
      element.classList.add('scrollBottomScroll');
      element1.classList.add('scrollTopScroll');
    } else if (this.st == 0) {
      element1.classList.remove('scrollTopScroll');
    } else if (Math.round(this.st + ch) === e.target.scrollHeight) {
      element.classList.remove('scrollBottomScroll');
    } else if (this.st > this.lastScrollTop) {
      element.classList.add('scrollBottomScroll');
      element1.classList.remove('scrollTopScroll');
    } else {
      element.classList.remove('scrollBottomScroll');
      element1.classList.add('scrollTopScroll');
    }
    this.lastScrollTop = this.st;
  }

}
