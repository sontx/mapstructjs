import { useEffect, useState } from 'react';

const windowObj: any = window;

windowObj.__console__log = console.log;
windowObj.__console__warn = console.warn;
windowObj.__console__error = console.error;
windowObj.__console__debug = console.debug;

export type LogType = 'info' | 'warn' | 'error' | 'debug';

export interface LogItemData {
  message: any[];
  type: LogType;
  createdAt: Date;
}

export function useLogWatcher() {
  const [logs, setLogs] = useState<LogItemData[]>([]);

  useEffect(() => {
    const createLogItem = (message: any[], type: LogType): LogItemData => ({
      createdAt: new Date(),
      message: message,
      type: type,
    });

    console.log = (...params: any[]) => {
      setLogs((prevState) => [...prevState, createLogItem(params, 'info')]);
      windowObj.__console__log(...params);
    };

    console.warn = (...params: any[]) => {
      setLogs((prevState) => [...prevState, createLogItem(params, 'warn')]);
      windowObj.__console__warn(...params);
    };

    console.error = (...params: any[]) => {
      setLogs((prevState) => [...prevState, createLogItem(params, 'error')]);
      windowObj.__console__error(...params);
    };

    console.debug = (...params: any[]) => {
      setLogs((prevState) => [...prevState, createLogItem(params, 'debug')]);
      windowObj.__console__debug(...params);
    };

    return () => {
      console.log = windowObj.__console__log;
      console.warn = windowObj.__console__warn;
      console.error = windowObj.__console__error;
      console.debug = windowObj.__console__debug;
    };
  }, [setLogs]);

  return { logs, setLogs };
}
