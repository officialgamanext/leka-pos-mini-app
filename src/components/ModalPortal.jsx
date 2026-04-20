import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * ModalPortal — renders children directly into document.body,
 * bypassing ALL parent stacking contexts (transforms, z-index, overflow)
 * so modals always appear on top of everything: header, nav, everything.
 */
const ModalPortal = ({ children }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return createPortal(children, document.body);
};

export default ModalPortal;
