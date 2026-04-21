'use client';

import React, { useEffect, useState } from 'react';
import { RequestUtil } from '../../../misc';
import { showAlert, showSuccess } from '../../../message';

interface PermittedPhoneNumber {
  name: string;
  phoneNumber: string;
}

interface PermittedPhoneNumberCache {
  permittedPhoneNumbers: PermittedPhoneNumber[];
}

interface SmsModalProps {
  phoneNumber: string;
  onClose: () => void;
}

export const SmsModal = ({ phoneNumber, onClose }: SmsModalProps) => {
  const [senderAddress, setSenderAddress] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [senderList, setSenderList] = useState<PermittedPhoneNumber[]>([]);
  const [loadingSenderList, setLoadingSenderList] = useState(false);

  // SMS content length calculation (in bytes for Korean)
  const getByteLength = (str: string): number => {
    let byteLength = 0;
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      if (charCode <= 0x7f) {
        byteLength += 1;
      } else if (charCode <= 0x7ff) {
        byteLength += 2;
      } else {
        byteLength += 2; // Korean characters are typically 2 bytes in EUC-KR
      }
    }
    return byteLength;
  };

  const byteLength = getByteLength(content);
  const isLms = byteLength > 90;

  // Fetch sender list on modal mount
  useEffect(() => {
    const fetchSenderList = async () => {
      setLoadingSenderList(true);
      try {
        const response = await RequestUtil.getExternalApiDataWithError({
          url: '/api/v1/sms-sender/list',
          method: 'GET',
        });

        const senderCache = response.data as PermittedPhoneNumberCache;
        if (senderCache && senderCache.permittedPhoneNumbers) {
          setSenderList(senderCache.permittedPhoneNumbers);
          // If there's only one sender, auto-select it
          if (senderCache.permittedPhoneNumbers.length === 1) {
            setSenderAddress(senderCache.permittedPhoneNumbers[0]!.phoneNumber);
          }
        }
      } catch (error) {
        console.error('Failed to fetch sender list:', error);
        showAlert({
          message: '발신번호 목록을 불러올 수 없습니다.',
          title: '오류',
          icon: 'error',
        });
      } finally {
        setLoadingSenderList(false);
      }
    };

    fetchSenderList();
  }, []);

  const handleSend = async (senderAddress: string) => {
    if (!senderAddress) {
      showAlert({
        message: '발신번호를 선택해주세요.',
        title: '알림',
        icon: 'error',
      });
      return;
    }

    if (!content.trim()) {
      showAlert({
        message: '메시지 내용을 입력해주세요.',
        title: '알림',
        icon: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const notificationQueue = {
        senderAddress: senderAddress,
        notificationType: 'SMS',
        content: content,
        toList: [{ address: phoneNumber }],
      };

      const response = await RequestUtil.getExternalApiDataWithError({
        url: '/notification/send',
        method: 'POST',
        formData: notificationQueue,
      });

      if (response.data) {
        showSuccess({
          message: 'SMS가 성공적으로 전송되었습니다.',
        });
        onClose();
      } else {
        showAlert({
          message: response.error || 'SMS 전송에 실패했습니다.',
          title: '오류',
          icon: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to send SMS:', error);
      showAlert({
        message: 'SMS 전송 중 오류가 발생했습니다.',
        title: '오류',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rcm-modal-body">
      <div className="rcm-modal-field-group">
        <label className="rcm-modal-label">발신번호 *</label>
        <select
          className="rcm-select"
          value={senderAddress}
          onChange={(e) => setSenderAddress(e.target.value)}
          disabled={loadingSenderList || senderList.length === 0}
        >
          <option value="">발신번호를 선택해주세요</option>
          {senderList.map((sender, index) => (
            <option key={index} value={sender.phoneNumber}>
              {sender.name} ({sender.phoneNumber})
            </option>
          ))}
        </select>
        {senderList.length === 0 && !loadingSenderList && (
          <p className="rcm-modal-warning">사용 가능한 발신번호가 없습니다.</p>
        )}
      </div>

      <div className="rcm-modal-field-group">
        <label className="rcm-modal-label">수신자 전화번호</label>
        <input type="text" className="rcm-input" value={phoneNumber} disabled readOnly />
      </div>

      <div className="rcm-modal-field-group">
        <label className="rcm-modal-label">메시지 내용</label>
        <textarea
          className="rcm-textarea rcm-sms-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="메시지 내용을 입력해주세요."
        />
        <div className="rcm-sms-meta">
          <span>
            {isLms ? (
              <span className="rcm-sms-lms-notice">LMS로 발송됩니다 (90바이트 초과)</span>
            ) : (
              <span>SMS ({byteLength}/90 바이트)</span>
            )}
          </span>
          <span>{content.length}자</span>
        </div>
      </div>

      <div className="rcm-modal-footer">
        <button
          type="button"
          className="rcm-button"
          data-variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          취소
        </button>
        <button
          type="button"
          className="rcm-button"
          data-variant="primary"
          onClick={() => {
            (async () => {
              await handleSend(senderAddress);
            })();
          }}
          disabled={loading || !content.trim() || !senderAddress}
        >
          {loading ? '발송 중...' : '발송'}
        </button>
      </div>
    </div>
  );
};
