// Modal.tsx
import React, { useEffect, useRef, useState } from 'react';
import termsContent from './termsContent';
import privacyContent from './privacyContent';

const Modal = ({ isOpen, onClose, contentType, children, parentCheckboxChecked, handleParentCheckboxChange }) => {
  const modalContentRef = useRef(null);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [modalCheckboxChecked, setModalCheckboxChecked] = useState(parentCheckboxChecked);
  // const [checkboxLabel, setCheckboxLabel] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = modalContentRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop === clientHeight;

      setShowCloseButton(isScrolledToBottom);
    };

    if (isOpen && modalContentRef.current) {
      modalContentRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (modalContentRef.current) {
        modalContentRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    setModalCheckboxChecked(parentCheckboxChecked);
  }, [parentCheckboxChecked]);

  const handleCheckboxChange = () => {
    handleParentCheckboxChange(); // 부모 컴포넌트에서 전달한 함수 호출
  };

  if (!isOpen) {
    return null;
  }

  let content = null;
  if (contentType === 'terms') {
    content = termsContent;
  } else if (contentType === 'privacy') {
    content = privacyContent;
  }

  // console.log(contentType) // contentType 확인용

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content whitespace-break-spaces" ref={modalContentRef}>
          {content && (
              <div>
                {content}
                {children}
              </div>
            )}
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={modalCheckboxChecked}
                  onChange={() => {
                    setModalCheckboxChecked(!modalCheckboxChecked);
                    handleParentCheckboxChange(!modalCheckboxChecked);
                  }}
                />
                {/* {checkboxLabel} */}
                {contentType === 'terms'
                ? "이용약관 동의(확인)"
                : contentType === 'privacy'
                ? "개인정보 수집/이용 동의(확인)"
                : "동의(확인)"}
              </label>
          </div>
        </div>
        <button className="modal-close" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default Modal;