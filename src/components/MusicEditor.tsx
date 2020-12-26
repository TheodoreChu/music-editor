import React from 'react';
import { EditorKit, EditorKitDelegate } from 'sn-editor-kit';
import { Vex, VexTab, Artist } from 'vextab';
import { debounce } from 'lodash';
import { HelpIcon, PrintIcon } from './Icons';

enum ComponentDataKey {
  Mode = 'mode',
}

enum HtmlElementId {
  ColumnResizer = 'column-resizer',
  Editor = 'editor',
  EditorContainer = 'editor-container',
  Header = 'header',
  MusicEditor = 'music-editor',
  View = 'view',
  HelpButton = 'help-button',
  PrintButton = 'print-button',
}

enum HtmlClassName {
  Dragging = 'dragging',
  NoSelection = 'no-selection',
}

type Mode = {
  type: ModeType;
  label: string;
  css: string;
};

enum ModeType {
  Edit = 0,
  Split = 1,
  View = 2,
}

const modes = [
  { type: ModeType.Edit, label: 'Edit', css: 'edit' } as Mode,
  { type: ModeType.Split, label: 'Split', css: 'split' } as Mode,
  { type: ModeType.View, label: 'View', css: 'view' } as Mode,
];

enum MouseEvent {
  Down = 'mousedown',
  Move = 'mousemove',
  Up = 'mouseup',
}

interface EditorInterface {
  text: string;
  mode: Mode;
  platform?: string;
  success: boolean;
}

const debugMode = false;

const initialState = {
  mode: modes[1],
  success: false,
  text: 'options scale=1.0\n\ntabstave notation=true tablature=false\nnotes ',
};

const keyMap = new Map();

let scrollY: number;

export default class MusicEditor extends React.Component<{}, EditorInterface> {
  editorKit: any;
  note: any;
  saveTimer: NodeJS.Timeout | undefined;

  constructor(props: EditorInterface) {
    super(props);
    this.state = initialState;
  }

  componentDidMount = () => {
    this.configureEditorKit();
    this.configureResizer();
  };

  configureEditorKit = () => {
    const delegate = new EditorKitDelegate({
      /** This loads every time a different note is loaded */
      setEditorRawText: (text: string) => {
        this.setState(
          {
            text,
          },
          () => {
            if (!this.state.text) {
              this.setState({
                text: initialState.text,
              });
            }
            this.renderMusic();
            this.loadSavedMode();
          }
        );
      },
      clearUndoHistory: () => {},
      getElementsBySelector: () => [],
    });

    this.editorKit = new EditorKit({
      delegate: delegate,
      mode: 'plaintext',
      supportsFilesafe: false,
    });
  };

  saveNote = (text: string) => {
    /** This will work in an SN context, but may break the standalone editor,
     * so we need to catch the error
     */
    try {
      this.editorKit.onEditorValueChanged(text);
    } catch (error) {
      console.log('Error saving note:', error);
    }
  };

  handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = event.target;
    const value = target.value;
    this.saveText(value);
  };

  saveText = (text: string) => {
    this.saveNote(text);
    this.setState(
      {
        text: text,
      },
      () => {
        // Do not re-render music in edit-only mode
        if (this.state.mode !== modes[0]) {
          if (this.saveTimer) {
            clearTimeout(this.saveTimer);
          }
          debounce(() => {
            this.renderMusic();
          }, 300);
          this.saveTimer = setTimeout(() => {
            this.renderMusic();
          }, 350);
        }
      }
    );
  };

  renderMusic = () => {
    try {
      const view = document.getElementById(HtmlElementId.View);
      if (view) {
        if (this.state.success) {
          /** Only save scrollY if it's a success.
           * Otherwise almost every change (e.g, typing C before the C/4)
           * will reset the scroll, and the scroll won't be preserved.
           */
          scrollY = view.scrollTop;
        }
        view.innerHTML = '';
      }

      // Create VexFlow Renderer from canvas element with id #view
      const Renderer = Vex.Flow.Renderer;
      const renderer = new Renderer(view, Renderer.Backends.SVG);

      // Initialize VexTab artist and parser.
      const artist = new Artist(10, 10, 600, { scale: 0.8 });
      const tab = new VexTab(artist);

      tab.parse(this.state.text);
      artist.render(renderer);
      if (!this.state.success) {
        this.setState({
          success: true,
        });
      }
      if (view) {
        // Keep the vertical scrolling
        view.scrollTop = scrollY;
      }
    } catch (e) {
      this.setState(
        {
          success: false,
        },
        () => {
          const view = document.getElementById(HtmlElementId.View);
          if (view) {
            const helpMessage = `<br/><br/><hr/><br/>Need help? Check out the <a href="https://vexflow.com/vextab/tutorial.html" target="_blank" rel="nofollow noreferrer noopener">VexTab Tutorial</a>.`;
            view.innerHTML = e + helpMessage;
          }
          if (debugMode) {
            console.log(e);
          }
        }
      );
    }
  };

  loadSavedMode = () => {
    try {
      const savedMode = this.editorKit.internal.componentManager.componentDataValueForKey(
        ComponentDataKey.Mode
      ) as ModeType;
      if (debugMode) {
        console.log('loaded savedMode: ' + savedMode);
      }
      // We can't use if(savedMode) because it would return false for 0
      if (typeof savedMode === 'number') {
        this.setModeFromModeType(savedMode);
      }
      this.setState(
        {
          platform: this.editorKit.internal.componentManager.platform,
        },
        () => {
          if (debugMode) {
            console.log(this.state.platform);
          }
        }
      );
    } catch (e) {
      if (debugMode) {
        console.log('Error when loading saved mode: ' + e);
      }
    }
  };

  setModeFromModeType = (value: ModeType) => {
    for (const mode of modes) {
      if (mode.type === value) {
        this.logDebugMessage('setModeFromModeType mode: ', mode.type);
        this.setState(
          {
            mode,
          },
          () => {
            this.renderMusic();
          }
        );
        return;
      }
    }
  };

  changeMode = (mode: Mode) => {
    this.setState(
      {
        mode,
      },
      () => {
        this.renderMusic();
      }
    );
    this.logDebugMessage('changeMode mode: ', mode.type);
    try {
      this.editorKit.internal.componentManager.setComponentDataValueForKey(
        ComponentDataKey.Mode,
        mode.type
      );
    } catch (e) {
      if (debugMode) {
        console.log('Error saving mode: ' + e);
      }
    }
  };

  removeSelection = () => {
    let selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  };

  configureResizer = () => {
    const MusicEditor = document.getElementById(HtmlElementId.MusicEditor);
    const editor = document.getElementById(HtmlElementId.Editor);
    const columnResizer = document.getElementById(HtmlElementId.ColumnResizer);
    let pressed = false;
    let safetyOffset = 15;
    let resizerWidth = 0;
    if (columnResizer) {
      resizerWidth = columnResizer.offsetWidth;
    }

    if (editor && columnResizer) {
      columnResizer.addEventListener(MouseEvent.Down, (event) => {
        pressed = true;
        columnResizer.classList.add(HtmlClassName.Dragging);
        editor.classList.add(HtmlClassName.NoSelection);
      });
    }

    document.addEventListener(MouseEvent.Move, (event) => {
      if (!pressed) {
        return;
      }
      let x = event.clientX;
      if (MusicEditor) {
        if (x < resizerWidth / 2 + safetyOffset) {
          x = resizerWidth / 2 + safetyOffset;
        } else if (x > MusicEditor.offsetWidth - resizerWidth - safetyOffset) {
          x = MusicEditor.offsetWidth - resizerWidth - safetyOffset;
        }
      }

      const colLeft = x - resizerWidth / 2;
      if (columnResizer) {
        columnResizer.style.left = colLeft + 'px';
      }
      if (editor) {
        editor.style.width = colLeft - safetyOffset + 'px';
      }

      this.removeSelection();
    });

    document.addEventListener(MouseEvent.Up, (event) => {
      if (pressed) {
        pressed = false;
        if (columnResizer) {
          columnResizer.classList.remove(HtmlClassName.Dragging);
        }
        if (editor) {
          editor.classList.remove(HtmlClassName.NoSelection);
        }
      }
    });
  };

  onBlur = () => {
    keyMap.clear();
  };

  onFocus = (e: React.FocusEvent) => {};

  onKeyDown = (event: React.KeyboardEvent) => {
    keyMap.set(event.key, true);
    if (!keyMap.get('Shift') && keyMap.get('Tab')) {
      event.preventDefault();
      document.execCommand('insertText', false, '\t');
    } else if (keyMap.get('Control') && keyMap.get('s')) {
      event.preventDefault();
    }
  };

  onKeyUp = (event: React.KeyboardEvent) => {
    keyMap.delete(event.key);
  };

  logDebugMessage = (message: string, object: any) => {
    if (debugMode) {
      console.log(message, object);
    }
  };

  print = () => {
    this.renderMusic();
    window.print();
  };

  render() {
    return (
      <div
        className={'sn-component ' + this.state.platform}
        id={HtmlElementId.MusicEditor}
        tabIndex={0}
      >
        <div id={HtmlElementId.Header}>
          <div className="segmented-buttons-container sk-segmented-buttons">
            <div className="buttons">
              {modes.map((mode) => (
                <button
                  onClick={() => this.changeMode(mode)}
                  className={
                    'sk-button button ' +
                    (this.state.mode === mode
                      ? 'selected info'
                      : 'sk-secondary-contrast')
                  }
                  title={'Turn on ' + mode.label + ' Mode'}
                >
                  <div className="label">{mode.label}</div>
                </button>
              ))}
            </div>
          </div>
          <a
            href="https://musiceditor.net"
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
          >
            <button
              className={'sk-button button sk-secondary-contrast icon-button'}
              id={HtmlElementId.HelpButton}
              title={'Help'}
            >
              <span>&nbsp;</span>
              <HelpIcon role="button" />
              <span>&nbsp;</span>
            </button>
          </a>
          <button
            className={'sk-button button sk-secondary-contrast icon-button'}
            id={HtmlElementId.PrintButton}
            onClick={() => this.print()}
            title="Print rendered music"
          >
            <span>&nbsp;</span>
            <PrintIcon role="button" />
            <span>&nbsp;</span>
          </button>
        </div>
        <main
          id={HtmlElementId.EditorContainer}
          className={this.state.mode.css}
        >
          <textarea
            autoCapitalize="false"
            autoComplete="false"
            className={this.state.mode.css}
            dir="auto"
            id={HtmlElementId.Editor}
            onBlur={this.onBlur}
            onChange={this.handleInputChange}
            onKeyDown={this.onKeyDown}
            onKeyUp={this.onKeyUp}
            spellCheck="false"
            value={this.state.text}
          />
          <div
            className={this.state.mode.css}
            id={HtmlElementId.ColumnResizer}
          ></div>
          <section
            className={
              this.state.mode.css + (this.state.success ? ' success' : '')
            }
            id={HtmlElementId.View}
            tabIndex={0}
          ></section>
        </main>
      </div>
    );
  }
}
