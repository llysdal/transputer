import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { TransputerApiService } from './transputer-api.service';
import { interval, timer, Subject, Observable, of } from 'rxjs';
import { take, finalize, tap, takeUntil, switchMap, repeat, repeatWhen } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-transputer',
  templateUrl: './transputer.component.html',
  styleUrls: ['./transputer.component.scss']
})
export class TransputerComponent implements OnInit {

  //Flags
  isEditing = true;
  isAssembling = false;
  isPlaying = false;
  showResult = false;
  hitCycleLimit = false;
  passedTest = false;
  passedHiddenTest = false;

  private onPause$ = new Subject<void>();
  
  //Transputer settings
  cpuAmount = 1;
  maxCpuAmount = 6;
  universalClock = 0;
  programLength = 0;
  maxRecordedProgramLength = 0;
  clockSpeed = 228;

  //Components
  subprograms = [];
  cpus = [];
  memory: any;
  io: any;

  //Tasks
  task: any;
  maxTask;

  //Defaults
  defaultCpuState = {
    pc: 0,
    registers: [0, 0, 0, 0],
    flags: {carry: false, zero: false},
    line: null
  }
  
  constructor(
    private transputerService: TransputerApiService,
    private cookieService: CookieService,
  ) { }

  ngOnInit(): void {
    this.resetToDefault();

    //Get task
    this.getTask(0);

    //Initialize cookie saver
    interval(5000).subscribe(res => this.saveCookie());

    //Get progress
    if (this.cookieService.check('progress')) {
      this.maxTask = this.cookieService.get('progress');
    } else {
      this.cookieService.set('progress', '0');
      this.maxTask = 0;
    }
  }

  async getTask(id) {
    this.task = await this.transputerService.getTask(id).toPromise();

    this.resetToDefault();

    const hasCookie = this.cookieService.check(this.task.name);
    if (hasCookie) {
      console.log('loading '+this.task.name);
      const cookie = JSON.parse(this.cookieService.get(this.task.name));
      this.cpuAmountSet(cookie.cpuAmount);
      this.subprograms = cookie.subprograms;
    }
  }

  resetToDefault() {
    //Set flags
    this.isEditing = true;
    this.showResult = false;

    //Load CPU code from default
    this.subprograms = [];
    for (let i = 0; i < this.maxCpuAmount; i++) {
      this.subprograms.push({
        code: ''
      });
    }

    this.cpuAmount = 1;
    //Initialize CPUS to default state
    this.cpus = [];
    for (let i = 0; i < this.cpuAmount; i++) {
      this.cpus.push({
        errors: [],
        states: [],
        state: this.defaultCpuState
      });
    }

    //Initialize RAM
    this.memory = {
      states: [],
      state: [0,0,0,0,0,0,0,0,
              0,0,0,0,0,0,0,0]
    }

    //Initialize IO
    this.io = {
      states: [],
      state: {input: [], output: []}
    }
  }

  saveCookie() {
    const data = {
      'cpuAmount': this.cpuAmount,
      'subprograms': this.subprograms,
    }
    console.log('saving '+this.task.name);
    this.cookieService.set(this.task.name, JSON.stringify(data));
  }

  assemble() {
    this.isAssembling = true;
    this.isEditing = false;
    this.maxRecordedProgramLength = 0;
    let program = [];

    //Assemble program from subprograms
    this.cpus.forEach((cpu, index) => program.push(this.subprograms[index].code));
    
    let errors = false;
    this.transputerService.assembleProgram(program).subscribe( res => {
      this.cpus.forEach((cpu, index) => {
        const cpuErrors = res[index];
        if (cpuErrors.length > 0) {
          errors = true;
        }
        cpu.errors = cpuErrors;
      });

      if (errors) {
        console.log('assembly: errors');

        interval(500).pipe(
          take(1), 
          finalize(() => {
            this.isEditing = true;
            this.isAssembling = false;
          })
        ).subscribe(res => res);

        return;
      }

      this.transputerService.emulateProgram(this.task.id, program).subscribe( res => {
        this.hitCycleLimit = res['hitCycleLimit'];
        this.passedTest = res['passedTest'];
        this.passedHiddenTest = res['passedHiddenTest'];
        const programStates = res['programStates'];
        

        this.universalClock = 0;
        this.programLength = programStates.length;
        this.cpus.forEach((cpu, index) => {
          cpu.states = programStates.map(cycle => cycle.cpus[index]);
          cpu.state = cpu.states[0]
        });

        this.memory.states = programStates.map(cycle => cycle.memory);
        this.memory.state = this.memory.states[0];
        this.io.states = programStates.map(cycle => cycle.io);
        this.io.state = this.io.states[0];

        console.log('assembly: successful')
        this.isEditing = false;
        this.isAssembling = false;
      });
    });
  }

  edit() {
    this.isEditing = true;
    this.showResult = false;
    this.pause();

    this.programLength = 0;
    this.maxRecordedProgramLength = 0;
    this.universalClock = 0;
    this.cpus.forEach(cpu => {
      cpu.states = [];
      cpu.state = this.defaultCpuState;
      cpu.errors = [];
    });
    this.memory.state = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    this.io.state = {input: [], output: []}
  }

  cpuAmountSet(amount) {
    this.cpuAmount = amount;
    this.cpus = [];
    for (let i = 0; i < this.cpuAmount; i++) {
      this.cpus.push({
        errors: [],
        states: [],
        state: this.defaultCpuState
      });
    }
  }

  cpuAmountIncrease() {
    if (this.cpuAmount < this.maxCpuAmount) {
      this.cpus.push({
        errors: [],
        states: [],
        state: this.defaultCpuState
      });
      this.cpuAmount += 1;
    }
  }

  cpuAmountDecrease() {
    if (this.cpuAmount > 1) {
      this.cpus.pop();
      this.cpuAmount -= 1;
    }
  }

  play() {
    if (!this.isEditing && !this.isAssembling && this.universalClock < this.programLength - 1) {
      this.isPlaying = true;

      let counter = 999999999;

      timer(0,1).pipe(
        takeUntil(this.onPause$),
      ).subscribe(event => {
        counter += 1;

        const clockMult = (this.clockSpeed - 57) / 53.3125 + 1

        if (counter > 100 / clockMult) {
          this.advance()
          counter = 0;
        }
      });
    }
  }

  pause() {
    this.onPause$.next();
    this.isPlaying = false;
  }

  skipToStart() {
    this.universalClock = 0;
    this.cpus.forEach(cpu => cpu.state = cpu.states[0]);
    this.memory.state = this.memory.states[0];
    this.io.state = this.io.states[0];
    this.pause()
  }

  skipToEnd() {
    this.pause()
    this.isPlaying = true;
    timer(0, 1).pipe(
      tap(() => this.advance()),
      takeUntil(this.onPause$)
    ).subscribe(res => res);
  }

  advance() {
    if (this.universalClock < this.programLength - 1) {
      this.universalClock += 1;
      if (this.maxRecordedProgramLength < this.universalClock) {
        this.maxRecordedProgramLength += 1;
      }
      this.cpus.forEach(cpu => cpu.state = cpu.states[this.universalClock]);
      this.memory.state = this.memory.states[this.universalClock];
      this.io.state = this.io.states[this.universalClock];
    } else {
      //Check if successful
      if (this.passedTest && this.passedHiddenTest && this.task.id == this.maxTask) {
        this.cookieService.set('progress', this.task.id + 1);
        this.maxTask = this.task.id + 1;
      }
      this.showResult = true;
      this.pause();
    }
  }

  rewind() {
    if (this.universalClock > 0) {
      this.universalClock -= 1;
      this.cpus.forEach(cpu => cpu.state = cpu.states[this.universalClock]);
      this.memory.state = this.memory.states[this.universalClock];
      this.io.state = this.io.states[this.universalClock];
    }
  }
}