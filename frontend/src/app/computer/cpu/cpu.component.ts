import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { NgModel } from '@angular/forms';
import { range } from 'rxjs';

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

  editor;
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
    occurrencesHighlight: false,
    renderIndentGuides: false,
    renderLineHighlight: 'none',
    selectionHighlight: false,
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

    editor.onDidChangeModelContent((event) => {
      this.updateDecorators(event.changes[0]);
    });
  }

  ngOnChanges(changes) {
    if (!this.initialized) {
      return;
    }
    
    if (changes.isEditing) {
      if (this.isEditing) {
        this.editor.updateOptions({ readOnly: false, cursorBlinking: "blink" });
      } else {
        this.editor.updateOptions({ readOnly: true, cursorBlinking: "solid"});
      }
    }

    if (changes.errors && this.errors.length !== 0) {
      let decoraterArray = [];

      for (let error of this.errors) {
        decoraterArray.push({
          range: new monaco.Range(error.line + 1, 1, error.line + 1, 1),
          options: {
            isWholeLine: true,
            className: 'errorLine',
            marginClassName: 'errorLine',
          }
        });
      }

      this.decorators = this.editor.deltaDecorations(this.decorators, decoraterArray);
    }

    if (changes.state) {
      if (this.state.line !== null) {
        this.decorators = this.editor.deltaDecorations(this.decorators, [
          {
            range: new monaco.Range(this.state.line + 1, 1, this.state.line + 1, 1),
            options: {
              isWholeLine: true,
              className: 'hightlightedLine',
              marginClassName: 'hightlightedLine',
            }
          }
        ]);
      } else {
        this.decorators = this.editor.deltaDecorations(this.decorators, []);
      }
    } 
    // else {
    //   //this.decorators = this.editor.deltaDecorations(this.decorators, []);
    // }
  }

  updateDecorators(changes) {
    let decorations = this.editor.getLineDecorations(changes.range.startLineNumber);

    if (decorations.length > 0) {
      decorations = decorations.map((decoration) => decoration.id);

      this.editor.deltaDecorations(decorations, []);
    }
  }

  onChange(event) {
    this.emitCode();
  }

  emitCode() {
    this.codeBuffer.emit(this.code);
  }


}
