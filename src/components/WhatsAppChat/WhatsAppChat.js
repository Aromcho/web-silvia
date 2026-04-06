'use client';
import { useState, useEffect } from 'react';
import './WhatsAppChat.css';

const WhatsAppChat = ({ isOpen: externalIsOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Mostrar la burbuja después de 2 segundos solo si no hay control externo
    if (!onClose) {
      const timer = setTimeout(() => setShowBubble(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  // Sincronizar con el estado externo si existe
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  const handleToggle = () => {
    if (onClose) {
      onClose();
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleSendMessage = (quickMessage = '') => {
    const messageText = quickMessage || message;
    if (!messageText.trim()) return;

    const whatsappURL = `https://wa.me/542255626092?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappURL, '_blank');
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
    setMessage('');
  };

  const handleQuickAction = (type) => {
    if (type === 'alquileres') {
      window.open('https://wa.me/5492255622841', '_blank');
    } else if (type === 'ventas') {
      window.open('https://wa.me/542255626092', '_blank');
    }
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Botón flotante de WhatsApp - solo mostrar si no hay control externo */}
      {!onClose && (
        <div className={`whatsapp-float ${isOpen ? 'chat-open' : ''}`}>
          <button 
            className="whatsapp-button"
            onClick={handleToggle}
            aria-label="Chat de WhatsApp"
          >
          {isOpen ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          )}
        </button>

        {/* Burbuja de mensaje */}
        {showBubble && !isOpen && (
          <div className="chat-bubble" onClick={() => setShowBubble(false)}>
            <p>Hola! ¿En qué puedo ayudarte?</p>
          </div>
        )}
        </div>
      )}

      {/* Modal de chat */}
      {isOpen && (
        <div className="whatsapp-chat-modal">
          <div className="chat-header">
            <div className="chat-header-info">
              <img 
                src="/assets/images/logo.jpg" 
                alt="Silvia Fernández" 
                className="chat-logo"
              />
              <div>
                <h4>Silvia Fernández</h4>
                <span>Propiedades</span>
              </div>
            </div>
          </div>

          <div className="chat-body">
            <div className="chat-message received">
              <p>Hola! ¿En qué puedo ayudarte?</p>
            </div>

            <div className="quick-actions">
              <button 
                className="quick-action-btn alquileres"
                onClick={() => handleQuickAction('alquileres')}
              >
                Alquileres
              </button>
              <button 
                className="quick-action-btn ventas"
                onClick={() => handleQuickAction('ventas')}
              >
                Ventas
              </button>
            </div>
          </div>

          <div className="chat-footer">
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="chat-input"
            />
            <button 
              className="send-button"
              onClick={() => handleSendMessage()}
              disabled={!message.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppChat;
