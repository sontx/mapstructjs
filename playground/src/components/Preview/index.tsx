import { StandardProps } from '../common';
import { useEffect } from 'react';
import { useBundleJs } from './useBundleJs';
import { useLogWatcher } from './useLogWatcher';
import classNames from 'classnames';

import './index.scss';
import { LogItem } from './LogItem';

export function Preview({ jsCode, className, ...rest }: StandardProps & { jsCode: string }) {
  const bundleJs = useBundleJs(jsCode);
  const { logs, setLogs } = useLogWatcher();

  useEffect(() => {
    try {
      // eslint-disable-next-line no-eval
      setLogs([]);
      eval(bundleJs);
    } catch (e) {
      console.warn(e);
    }
  }, [bundleJs, setLogs]);

  return (
    <div className={classNames('preview', className)} {...rest}>
      {logs.map((log, index) => (
        <LogItem key={index} log={log} />
      ))}
    </div>
  );
}
