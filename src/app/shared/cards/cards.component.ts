import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css'],
})
export class CardsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
  onButtonHover(image: HTMLElement): void {
    image.style.transform = 'translateY(-10px)';
  }

  onButtonLeave(image: HTMLElement): void {
    image.style.transform = 'translateY(0)';
  }
}
