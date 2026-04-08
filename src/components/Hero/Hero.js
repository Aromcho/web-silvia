'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { autocompleteProperties } from '../../services/propertyService';
import { FaHome, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import './Hero.css';

const Hero = () => {
  const router = useRouter();
  const [searchForm, setSearchForm] = useState({
    operation: 'venta',
    type: '',
    location: '',
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Autocompletado para ubicación
    if (name === 'location' && value.length > 2) {
      handleAutocomplete(value);
    } else if (name === 'location') {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAutocomplete = async (query) => {
    try {
      const results = await autocompleteProperties(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Error en autocompletado:', error);
      setSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion) => {
    setSearchForm(prev => ({
      ...prev,
      location: suggestion.value
    }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Construir query params para redirección
    const params = new URLSearchParams();
    
    if (searchForm.operation) {
      params.append('operation', searchForm.operation);
    }
    if (searchForm.type) {
      params.append('type', searchForm.type);
    }
    if (searchForm.location) {
      params.append('location', searchForm.location);
    }
    
    // Redirigir a página de búsqueda
    router.push(`/propiedades?${params.toString()}`);
  };

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const quickAccessCards = [
    { 
      id: 'alquiler', 
      title: 'Alquiler', 
      icon: <FaHome className="card-icon-element" />
    },
    { 
      id: 'lotes', 
      title: 'Lotes - Terrenos', 
      icon: <FaMapMarkerAlt className="card-icon-element" />
    },
    { 
      id: 'casas', 
      title: 'Casas', 
      icon: <FaHome className="card-icon-element" />
    },
    { 
      id: 'departamentos', 
      title: 'Departamentos', 
      icon: <FaBuilding className="card-icon-element" />
    },
    { 
      id: 'complejos', 
      title: 'Complejos', 
      icon: <FaBuilding className="card-icon-element" />
    }
  ];

  const handleQuickAccess = (cardId) => {
    if (cardId === 'alquiler') {
      router.push('/alquiler-temporario');
    } else if (cardId === 'lotes') {
      router.push('/lotes-terrenos');
    } else if (cardId === 'complejos') {
      router.push('/complejos');
    } else {
      // Para casas y departamentos
      const params = new URLSearchParams();
      params.append('operation', 'venta');
      
      const typeMap = {
        'casas': 'Casa',
        'departamentos': 'Departamento'
      };
      
      params.append('type', typeMap[cardId] || cardId);
      router.push(`/propiedades?${params.toString()}`);
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
                      <option value="Casa">Casa</option>
                      <option value="Departamento">Departamento</option>
                      <option value="Terreno">Terreno</option>
                      <option value="Local">Local</option>
                      <option value="Complejo">Complejo</option>
                    </select>
                    
                    <div className="autocomplete-wrapper" ref={suggestionsRef}>
                      <input
                        type="text"
                        name="location"
                        placeholder="Ubicación (ciudad, barrio, dirección...)"
                        value={searchForm.location}
                        onChange={handleInputChange}
                        className="search-input"
                        autoComplete="off"
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <ul className="autocomplete-suggestions">
                          {suggestions.map((suggestion, index) => (
                            <li 
                              key={index}
                              onClick={() => selectSuggestion(suggestion)}
                              className="autocomplete-item"
                            >
                              <strong>{suggestion.value}</strong>
                              {suggestion.secundvalue && (
                                <small>{suggestion.secundvalue}</small>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
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