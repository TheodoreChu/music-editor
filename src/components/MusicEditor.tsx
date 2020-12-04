import * as React from 'react';
import { EditorKit, EditorKitDelegate } from 'sn-editor-kit';
import { Vex, VexTab, Artist } from 'vextab';

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

enum MouseEvent {
  Down = 'mousedown',
  Move = 'mousemove',
  Up = 'mouseup',
}

enum HtmlElementId {
  ColumnResizer = 'column-resizer',
  Editor = 'editor',
  EditorContainer = 'editor-container',
  Header = 'header',
  MusicEditor = 'music-editor',
  View = 'view',
  PrintButton = 'print-button',
}

enum CssClassList {
  Dragging = 'dragging',
  NoSelection = 'no-selection',
}

enum ComponentDataKey {
  Mode = 'mode',
}

const modes = [
  { type: ModeType.Edit, label: 'Edit', css: 'edit' } as Mode,
  { type: ModeType.Split, label: 'Split', css: 'split' } as Mode,
  { type: ModeType.View, label: 'View', css: 'view' } as Mode,
];

type MusicEditorState = {
  text: string;
  mode: Mode;
  platform?: string;
  success: boolean;
};

const debugMode = false;

const keyMap = new Map();

const initialState = {
  mode: modes[1],
  text: 'options scale=1.0\n\ntabstave notation=true tablature=false\nnotes ',
  success: false,
};

export default class MusicEditor extends React.Component<{}, MusicEditorState> {
  editorKit: any;
  note: any;

  constructor(props: any) {
    super(props);
    this.state = initialState;
  }

  componentDidMount = () => {
    this.configureEditorKit();
    this.configureResizer();
  };

  configureEditorKit() {
    const delegate = new EditorKitDelegate({
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
  }

  saveNote = () => {
    this.editorKit.onEditorValueChanged(this.state.text);
  };

  handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = event.target;
    const value = target.value;

    this.setState(
      {
        text: value,
      },
      () => {
        this.saveNote();
        // Do not re-render music in edit-only mode
        if (this.state.mode !== modes[0]) {
          this.renderMusic();
        }
      }
    );
  };

  renderMusic = () => {
    const view = document.getElementById(HtmlElementId.View);
    if (view) {
      view.innerHTML = '';
    }
    // Create VexFlow Renderer from canvas element with id #view
    const Renderer = Vex.Flow.Renderer;
    const renderer = new Renderer(view, Renderer.Backends.SVG);

    // Initialize VexTab artist and parser.
    const artist = new Artist(10, 10, 600, { scale: 0.8 });
    const tab = new VexTab(artist);
    try {
      tab.parse(this.state.text);
      artist.render(renderer);
      if (!this.state.success) {
        this.setState({
          success: true,
        });
      }
    } catch (e) {
      this.setState(
        {
          success: false,
        },
        () => {
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
      if (savedMode) {
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
    const musicEditor = document.getElementById(HtmlElementId.MusicEditor);
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
        columnResizer.classList.add(CssClassList.Dragging);
        editor.classList.add(CssClassList.NoSelection);
      });
    }

    document.addEventListener(MouseEvent.Move, (event) => {
      if (!pressed) {
        return;
      }
      let x = event.clientX;
      if (musicEditor) {
        if (x < resizerWidth / 2 + safetyOffset) {
          x = resizerWidth / 2 + safetyOffset;
        } else if (x > musicEditor.offsetWidth - resizerWidth - safetyOffset) {
          x = musicEditor.offsetWidth - resizerWidth - safetyOffset;
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
          columnResizer.classList.remove(CssClassList.Dragging);
        }
        if (editor) {
          editor.classList.remove(CssClassList.NoSelection);
        }
      }
    });
  };

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

  onBlur = () => {
    keyMap.clear();
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
                >
                  <div className="sk-label">{mode.label}</div>
                </button>
              ))}
            </div>
          </div>
          <button
            className={'sk-button button sk-secondary-contrast'}
            id={HtmlElementId.PrintButton}
            onClick={() => this.print()}
          >
            <div className="sk-label">{'Print'}</div>
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
