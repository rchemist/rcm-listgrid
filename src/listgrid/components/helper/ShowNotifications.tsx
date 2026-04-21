'use client';

import { IconAlertTriangle, IconSquareRoundedX } from '@tabler/icons-react';
import React, { ReactNode, useEffect, useState } from 'react';
import { isTrue } from '../../utils/BooleanUtil';
import { ColorType } from '../../common/type';

interface ListGridNotificationsProps {
  messages?: string[] | Map<string, string>;
  error?: unknown;
  color?: ColorType;
  timeout?: number; // ms 단위로 입력. 지정된 시간 이후로 메시지가 사라지게 할 수 있다. 입력하지 않으면 그대로 둔다.
  showClose?: boolean;
  onClick?: (messageId?: string) => void;
  onTimeout?: () => void;
}

interface MessageItem {
  id: string;
  message: string;
}

export const ShowNotifications = ({
  error,
  color,
  timeout,
  showClose = false,
  onClick,
  ...props
}: ListGridNotificationsProps): React.ReactNode => {
  const bgColor =
    color !== undefined
      ? `bg-${color}-light`
      : isTrue(error)
        ? 'bg-danger-light'
        : 'bg-success-light';
  const textColor =
    color !== undefined ? `text-${color}` : isTrue(error) ? 'text-danger' : 'text-success';
  const [view, setView] = useState<ReactNode | null>(null);

  const processMessages = (): MessageItem[] => {
    if (!props.messages) return [];

    if (Array.isArray(props.messages)) {
      return props.messages
        .filter((message: string) => message !== undefined && message !== null && message !== '')
        .map((message: string, index: number) => ({
          id: index.toString(),
          message: message.replace(/(?:\r\n|\r|\n)/g, '<br />'),
        }));
    } else {
      const items: MessageItem[] = [];
      props.messages.forEach((value: string, key: string) => {
        if (value !== undefined && value !== null && value !== '') {
          items.push({
            id: key,
            message: value.replace(/(?:\r\n|\r|\n)/g, '<br />'),
          });
        }
      });
      return items;
    }
  };

  useEffect(() => {
    const messageItems = processMessages();

    // 중복을 제거한다.
    const uniqueMessages = messageItems.filter(
      (item, index, self) => index === self.findIndex((t) => t.message === item.message),
    );

    if (uniqueMessages.length > 0) {
      setView(
        <div className="pt-2">
          <div className={`h-full overflow-auto p-4 pr-2 ${bgColor}`}>
            <div className="rcm-notification-body">
              <div className={`${showClose ? 'flex items-start justify-between' : ''}`}>
                <div className={`${textColor} w-full`}>
                  {uniqueMessages.map((item: MessageItem) => (
                    <div
                      key={item.id}
                      id={item.id}
                      className={
                        'flex space-x-2 items-center font-semibold cursor-pointer hover:opacity-80'
                      }
                      onClick={() => onClick && onClick(item.id)}
                    >
                      <IconAlertTriangle className="h-6 w-6" />
                      <div dangerouslySetInnerHTML={{ __html: item.message }} />
                    </div>
                  ))}
                </div>
                {showClose && (
                  <div className={`${textColor}`}>
                    <button onClick={() => setView(null)}>
                      <IconSquareRoundedX className={`h-4 w-4 ${textColor}`} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
      );
    } else {
      setView(null);
    }

    if (timeout) {
      setTimeout(() => {
        setView(null);
        if (props.onTimeout) {
          props.onTimeout();
        }
      }, timeout);
    }
  }, [props.messages, bgColor, textColor, showClose, onClick, timeout]);

  return <>{view}</>;
};
