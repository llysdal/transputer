import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { CookieService } from 'ngx-cookie-service';

import { AppComponent } from './app.component';
import { CpuComponent } from './computer/cpu/cpu.component';
import { MemoryComponent } from './computer/memory/memory.component';
import { TransputerComponent } from './computer/transputer.component';

import { ManualComponent } from './computer/ui/manual/manual.component';
import { TaskSelectorComponent } from './computer/ui/task-selector/task-selector.component';

import { TransputerApiService } from './computer/transputer-api.service';

export function myMonacoLoad() {
  (window as any).monaco.languages.register({ id: 'hd61700' });

  // Register a tokens provider for the language
  (window as any).monaco.languages.setMonarchTokensProvider('hd61700', {
    tokenizer: {
      root: [
        [/;.*/, 'asm-comment'],
        [/[A-z]+[:]/, 'asm-label'],
        [/\b((byuw|bydw|cani|rtni|gfl|pfl|gpo|gst|pst|gre|pre|rou|rod|biu|bid|diu|did|inv|cmp|cal|rtn|bup|bdn|sup|sdn|nop|clt|fst|slw|off|trp|jp|jr)|(ldi|sti|pps|phs|ppu|phu|adb|sbb|adc|sbc|anc|nanc|orc|xrc|ld|st|ad|sb|an|na|or|xr)w?)\b/, 'asm-instruction'],
        [/\b(c|nc|z|nz|lz|uz)\b/, 'asm-flag'],
        [/\$\d+/, 'asm-register'],
        [/\d+/, 'asm-number'],
        [/&h[a-f0-9]*/, 'asm-hex'],
        [/[A-z]+/, 'asm-label-reference'],
      ]
    },
    ignoreCase: true
  });

  (window as any).monaco.editor.defineTheme('terminal', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'asm-instruction', foreground: '53a8e0' },
      { token: 'asm-label', foreground: 'af64d9', fontStyle: 'bold' },
      { token: 'asm-label-reference', foreground: 'af64d9'},
      { token: 'asm-flag', foreground: 'b07b2c' },
      { token: 'asm-register', foreground: 'bd3026' },
      { token: 'asm-number', foreground: 'e3beb8' },
      { token: 'asm-hex', foreground: '73d179' },
      { token: 'asm-comment', foreground: '6e6e6e' },
    ],
    colors: {
      'editor.lineHighlightBackground': '#000000', //Cursor background color
      'editor.selectionHighlightBackground': '#000000', //Similar items color
      'editor.background': '#000000', //Background
      'editor.selectionBackground': '#555555', //Selection
      'editorLineNumber.foreground': '#ffffff', //Line numbers
    },
  });
}

const monacoConfig: NgxMonacoEditorConfig = {
  onMonacoLoad: myMonacoLoad
};

@NgModule({
  declarations: [
    AppComponent,
    CpuComponent,
    TransputerComponent,
    MemoryComponent,
    ManualComponent,
    TaskSelectorComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    NgbModule,
    MonacoEditorModule.forRoot(monacoConfig),
  ],
  providers: [
    TransputerApiService, 
    CookieService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
