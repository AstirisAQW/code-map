import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import type { FileNodeData } from '../../types';

type PrismTheme = Record<string, React.CSSProperties>;

interface FileNodeBodyProps {
  file: FileNodeData;
  syntaxTheme: PrismTheme;
  codeBackground: string;
  lineNumberColor: string;
  themeName: string;
  paddingTop: number;
  lineHeight: number;
}

export function FileNodeBody({
  file,
  syntaxTheme,
  codeBackground,
  lineNumberColor,
  themeName,
  paddingTop,
  lineHeight,
}: FileNodeBodyProps) {
  return (
    <SyntaxHighlighter
      key={themeName}
      language={file.language}
      style={syntaxTheme}
      customStyle={{
        margin: 0,
        padding: `${paddingTop}px 1rem`,
        background: codeBackground,
        backgroundColor: codeBackground,
        fontSize: '12px',
        lineHeight: `${lineHeight}px`,
      }}
      showLineNumbers
      lineNumberStyle={{
        minWidth: '3em',
        paddingRight: '1em',
        color: lineNumberColor,
        textAlign: 'right',
      }}
    >
      {file.content}
    </SyntaxHighlighter>
  );
}