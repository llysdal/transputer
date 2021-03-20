import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-memory',
  templateUrl: './memory.component.html',
  styleUrls: ['./memory.component.scss']
})
export class MemoryComponent implements OnInit, OnChanges {

  @Input() state: any;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes) {
    
  }

  decToHex(number) {
    return (+number).toString(16).toUpperCase();
  }

}
