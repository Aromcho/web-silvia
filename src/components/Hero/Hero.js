'use client';
import { useState } from 'react';
import './Hero.css';

const Hero = () => {
  const [searchForm, setSearchForm] = useState({
    operation: 'venta',
    type: '',
    location: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching with filters:', searchForm);
  };

  const quickAccessCards = [
    { 
      id: 'alquiler', 
      title: 'Alquiler', 
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M21 2L19 4M19 4L15 8L19 12L23 8L19 4ZM19 4V2M15 8L13 10L5 18V21H8L16 13L15 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'lotes', 
      title: 'Lotes - Terrenos', 
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M21 16V8C20.9996 7.64928 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64928 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'casas', 
      title: 'Casas', 
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'departamentos', 
      title: 'Departamentos', 
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M3 21H21M3 10H21M5 6L12 3L19 6M4 10V21M20 10V21M8 14V18M12 14V18M16 14V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'complejos', 
      title: 'Complejos', 
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M18 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V4C20 2.89543 19.1046 2 18 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 6H9.01M15 6H15.01M9 10H9.01M15 10H15.01M9 14H9.01M15 14H15.01M9 18H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  const handleQuickAccess = (cardId) => {
    if (cardId === 'alquiler') {
      setSearchForm(prev => ({ ...prev, operation: 'alquiler' }));
    } else {
      setSearchForm(prev => ({ 
        ...prev, 
        operation: 'venta',
        type: cardId === 'lotes' ? 'terreno' : 
             cardId === 'complejos' ? 'hotel' : cardId 
      }));
    }
  };

  return (
    <section id="inicio" className="hero">
      {/* Video Background */}
      <div className="hero-video">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="hero-video-element"
          onError={(e) => {
            console.log('Video failed to load:', e);
            e.target.style.display = 'none';
          }}
        >
          <source src="/assets/videos/home-video.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        <div className="container">
          <div className="hero-text">
            <h1 className="hero-title">
              Encontrá tu hogar ideal con 
              <span className="hero-highlight"> Silvia Fernández</span>
            </h1>
            
            {/* Search Form */}
            <div className="hero-search">
              <div className="search-container">
                {/* Operation Tabs */}
                <div className="operation-tabs">
                  <button 
                    className={`operation-tab ${searchForm.operation === 'venta' ? 'active' : ''}`}
                    onClick={() => setSearchForm(prev => ({ ...prev, operation: 'venta' }))}
                  >
                    Venta
                  </button>
                  <button 
                    className={`operation-tab ${searchForm.operation === 'alquiler' ? 'active' : ''}`}
                    onClick={() => setSearchForm(prev => ({ ...prev, operation: 'alquiler' }))}
                  >
                    Alquiler
                  </button>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="search-form">
                  <div className="search-row">
                    <select 
                      name="type" 
                      value={searchForm.type}
                      onChange={handleInputChange}
                      className="search-select"
                    >
                      <option value="">Tipo de propiedad</option>
                      <option value="casa">Casa</option>
                      <option value="departamento">Departamento</option>
                      <option value="ph">PH</option>
                      <option value="terreno">Terreno</option>
                      <option value="hotel">Complejo</option>
                    </select>
                    
                    <input
                      type="text"
                      name="location"
                      placeholder="Ubicación"
                      value={searchForm.location}
                      onChange={handleInputChange}
                      className="search-input"
                    />
                  </div>
                  
                  <button type="submit" className="search-btn">
                    Buscar Propiedades
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Cards - Área inferior */}
        <div className="quick-access-section">
          <div className="quick-access-cards">
            {quickAccessCards.map((card) => (
              <div 
                key={card.id} 
                className="quick-access-card"
                onClick={() => handleQuickAccess(card.id)}
              >
                <div className="card-icon">{card.icon}</div>
                <h3 className="card-title">{card.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;