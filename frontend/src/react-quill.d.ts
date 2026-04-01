declare module 'react-quill' {
  import * as React from 'react';

  interface ReactQuillProps {
    id?: string;
    theme?: string;
    value?: string;
    defaultValue?: string;
    readOnly?: boolean;
    placeholder?: string;
    tabIndex?: number;
    bounds?: string | HTMLElement;
    onChange?: (content: string, delta: any, source: string, editor: any) => void;
    onChangeSelection?: (selection: any, source: string, editor: any) => void;
    onFocus?: (selection: any, source: string, editor: any) => void;
    onBlur?: (previousSelection: any, source: string, editor: any) => void;
    onKeyDown?: React.KeyboardEventHandler<any>;
    onKeyPress?: React.KeyboardEventHandler<any>;
    onKeyUp?: React.KeyboardEventHandler<any>;
    modules?: any;
    formats?: string[];
    children?: React.ReactElement<any>;
  }

  export default class ReactQuill extends React.Component<ReactQuillProps> {
    focus(): void;
    blur(): void;
    getEditor(): any;
  }
}
