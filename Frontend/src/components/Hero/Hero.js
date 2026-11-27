'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { autocompleteProperties } from '../../services/propertyService';
import { FaHome, FaMapMarkerAlt, FaBuilding, FaStore } from 'react-icons/fa';
import { searchHref } from '../../helpers/searchFilters';
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

    // Al único buscador, con lo elegido ya filtrado («Alquiler» + «Local» antes no devolvía nada:
    // ahora el buscador muestra los locales cuando se elige ese tipo).
    router.push(searchHref({
      operation: searchForm.operation,
      type: searchForm.type,
      location: searchForm.location.trim(),
    }));
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
      id: 'locales', 
      title: 'Locales', 
      icon: <FaStore className="card-icon-element" />
    }
  ];

  // Cada acceso rápido abre el buscador con su filtro puesto
  const QUICK_ACCESS_FILTERS = {
    alquiler: { operation: 'alquiler' },
    lotes: { type: 'Terreno' },
    casas: { type: 'Casa' },
    departamentos: { type: 'Departamento' },
    // Locales en alquiler: al alquilar, los locales solo aparecen eligiendo ese tipo
    locales: { operation: 'alquiler', type: 'Local' },
  };

  const handleQuickAccess = (cardId) => {
    router.push(searchHref(QUICK_ACCESS_FILTERS[cardId]));
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
              Tu inmobiliaria en 
              <span className="hero-highlight"> Mar Azul y Mar de las Pampas</span>
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
                      <FaMapMarkerAlt className="search-input-icon" />
                      <input
                        type="text"
                        name="location"
                        placeholder="Ciudad, barrio o dirección"
                        value={searchForm.location}
                        onChange={handleInputChange}
                        className="search-input search-input--with-icon"
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