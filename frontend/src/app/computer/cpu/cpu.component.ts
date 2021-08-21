import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-cpu',
  templateUrl: './cpu.component.html',
  styleUrls: ['./cpu.component.scss']
})
export class CpuComponent implements OnInit, OnChanges {

  @Input() state: any;
  @Input() errors: any;
  @Input() isEditing: boolean;
  @Input() initialCode: string;
  @Output() codeBuffer = new EventEmitter<string>();
  code: string;

  initialized = false;

  editor: any;
  decorators = [];

  editorOptions = {
    theme: 'terminal', 
    language: 'hd61700',
    minimap: { enabled: false },
    lineNumberMinChars: 3,
    quickSuggestions: false,
    cursorBlinking: "blink",
    contextmenu: false,
    matchBrackets: "never",
    cursorStyle: 'underline',
    roundedSelection: false,
    overviewRulerLanes: 0,
    renderIndentGuides: false,
    showFoldingControls: "always",
    scrollbar: { vertical: 'hidden', horizontal: 'auto' },
    scrollBeyondLastLine: false,
    smoothScrolling: false,
    mouseWheelScrollSensitivity: 0.38,
  };

  constructor() { 
  }

  ngOnInit(): void {
    this.code = this.initialCode;
    this.initialized = true;
  }

  monacoOnInit(editor) {
    this.editor = editor;
  }

  ngOnChanges(changes) {
    if (!this.initialized) {
      return;
    }
    
    if (this.isEditing) {
      this.editor.updateOptions({ readOnly: false, cursorBlinking: "blink" })
    } else {
      this.editor.updateOptions({ readOnly: true, cursorBlinking: "solid" })
    }
    if (this.errors.length !== undefined && this.errors.length !== 0 && this.isEditing) {
      let decoraterArray = [];

      for (let error of this.errors) {
        decoraterArray.push({
          range: new monaco.Range(error.line + 1, 1, error.line + 1, 100),
          options: {
            isWholeLine: true,
            className: 'errorLine'
          }
        });
      }

      this.decorators = this.editor.deltaDecorations(this.decorators, decoraterArray);

    } else if (this.state.line !== null) {
      this.decorators = this.editor.deltaDecorations(this.decorators, [
        {
          range: new monaco.Range(this.state.line + 1, 1, this.state.line + 1, 100),
          options: {
            isWholeLine: true,
            className: 'hightlightedLine'
          }
        }
      ]);
    } else {
      this.decorators = this.editor.deltaDecorations(this.decorators, []);
    }
  }

  emitCode() {
    this.codeBuffer.emit(this.code);
  }


}
