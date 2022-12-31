import { useEffect, useState } from 'react';
import { StandardProps } from '../common';

const EDITOR_CONTAINER_ID = 'monaco-editor-embed';

// eslint-disable-next-line import/no-webpack-loader-syntax
const mapstructjsDts = require('!raw-loader!../../mapstructjs.d.ts').default;

const windowObj: any = window;

class NoLog {
  log() {}
}

interface Sandbox {
  setText(text: string): void;
  getText(): string;
  getRunnableJS(): Promise<string>;
  languageServiceDefaults: any;
  editor: any;
}

function registerSuggestion() {
  const monaco = windowObj.monaco;
  const libUri = 'ts:mapstructjs/index.d.ts';
  monaco.languages.typescript.typescriptDefaults.addExtraLib(mapstructjsDts, libUri);
  if (!monaco.editor.getModel(mapstructjsDts)) {
    monaco.editor.createModel(mapstructjsDts, 'typescript', monaco.Uri.parse(libUri));
  }
}

let cacheSandboxObj: Sandbox;

export function Editor({
  onJsChange,
  tsCode,
  ...rest
}: StandardProps & { tsCode: string; onJsChange(jsCode: string): void }) {
  const [sandboxObj, setSandboxObj] = useState(cacheSandboxObj);

  useEffect(() => {
    if (sandboxObj) {
      sandboxObj.setText(tsCode);
      return;
    }

    const intervalId = setInterval(async () => {
      if (
        windowObj.tsSandboxFactory &&
        windowObj.tsMain &&
        windowObj.ts &&
        document.getElementById(EDITOR_CONTAINER_ID)
      ) {
        clearInterval(intervalId);

        registerSuggestion();

        const sandboxObj = windowObj.tsSandboxFactory.createTypeScriptSandbox(
          {
            text: tsCode,
            domID: EDITOR_CONTAINER_ID,
            logger: new NoLog(),
            compilerOptions: {
              strict: false,
              module: 'UMD',
              target: 'ES5',
              strictPropertyInitialization: false,
              moduleResolution: windowObj.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
              allowSyntheticDefaultImports: true,
              experimentalDecorators: true,
            },
            monacoSettings: {
              automaticLayout: true,
            },
          },
          windowObj.tsMain,
          windowObj.ts,
        );

        setSandboxObj(sandboxObj);
      }
    }, 100);
    return () => {
      clearInterval(intervalId);
    };
  }, [sandboxObj, tsCode]);

  useEffect(() => {
    if (!sandboxObj) {
      return;
    }

    let timeoutId: number | undefined;
    let cancel = false;

    const triggerJsChange = async () => {
      const jsCode = await sandboxObj.getRunnableJS();
      if (!cancel) {
        onJsChange(jsCode);
      }
    };

    const waitForChanges = async () => {
      await triggerJsChange();

      sandboxObj.editor.getModel().onDidChangeContent(() => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(async () => {
          clearTimeout(timeoutId);
          timeoutId = undefined;

          await triggerJsChange();
        }, 500);
      });
    };

    waitForChanges().then();

    return () => {
      cancel = true;
      clearTimeout(timeoutId);
    };
  }, [onJsChange, sandboxObj, tsCode]);

  return <div {...rest} id={EDITOR_CONTAINER_ID} />;
}
