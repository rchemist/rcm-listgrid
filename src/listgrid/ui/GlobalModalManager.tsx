'use client';

import React, { useEffect, useRef } from 'react';
import { Modal } from './UIProvider';
import { useModalManagerStore } from '../store';

/**
 * GlobalModalManager — renders the library's modal stack.
 *
 * Library field components (e.g. `<ManyToOneField>`) call
 * `useModalManagerStore().openModal(...)` to push a modal onto the stack.
 * Without this renderer mounted in the tree, nothing displays — the store
 * updates but no component subscribes.
 *
 * Mount once in your app layout, ABOVE the pages that use listgrid forms:
 *
 *   import { GlobalModalManager } from '@rchemist/listgrid';
 *
 *   <UIProvider components={...}>
 *     <GlobalModalManager />
 *     {children}
 *   </UIProvider>
 *
 * Host apps that already ship their own modal manager wired to a separate
 * store (e.g. `the legacy UI kit`) still need THIS component
 * — the two stores are independent zustand instances and do not share state.
 */
export const GlobalModalManager = () => {
  const { openModals, closeTopModal, closeModal } = useModalManagerStore();
  const scrollYRef = useRef<number>(0);

  // Body scroll lock while a modal is open, restored on close.
  useEffect(() => {
    if (openModals.length > 0) {
      if (openModals.length === 1) {
        scrollYRef.current = window.scrollY;
      }
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollYRef.current);
    }
  }, [openModals.length]);

  // ESC — close the topmost modal, unless it opted out.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const top = openModals[openModals.length - 1];
        if (top && top.closeOnEscape !== false) {
          closeTopModal();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openModals, closeTopModal]);

  if (openModals.length === 0) return null;

  return (
    <>
      {openModals.map((m) => (
        <Modal
          key={m.modalId}
          opened={true}
          title={m.title}
          size={m.size}
          zIndex={m.zIndex}
          closeOnClickOutside={m.closeOnClickOutside}
          closeOnEscape={false}
          onClose={() => closeModal(m.modalId)}
          maxHeight={m.maxHeight}
          fullHeight={m.fullHeight}
          fullScreen={m.fullScreen}
          verticalAlign={m.verticalAlign}
          showCloseButton={m.showCloseButton}
        >
          {m.content}
        </Modal>
      ))}
    </>
  );
};
