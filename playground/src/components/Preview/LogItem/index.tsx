import { StandardProps } from '../../common';
import { LogItemData } from '../useLogWatcher';
import classNames from 'classnames';
import ReactJson from 'react-json-view';

import './index.scss';

function ObjectView({ part }: { part: object }) {
  return (
    <ReactJson
      src={part}
      name={false}
      theme="summerfruit:inverted"
      enableClipboard={false}
      displayObjectSize={false}
      displayDataTypes={false}
    />
  );
}

function StringView({ part }: { part: any }) {
  return <span className="part__string">{part + ''}</span>;
}

function NotStringView({ part }: { part: any }) {
  return <span className="part__not_string">{part + ''}</span>;
}

function LogPart({ part }: { part: any }) {
  return (
    <div className="log-item__part">
      {typeof part === 'object' ? (
        <ObjectView part={part} />
      ) : typeof part === 'string' ? (
        <StringView part={part} />
      ) : (
        <NotStringView part={part} />
      )}
    </div>
  );
}

export function LogItem({ log, className, ...rest }: StandardProps & { log: LogItemData }) {
  return (
    <div className={classNames('log-item', 'log-item--' + log.type, className)} {...rest}>
      {log.message.map((part, index) => (
        <LogPart key={index} part={part} />
      ))}
    </div>
  );
}
