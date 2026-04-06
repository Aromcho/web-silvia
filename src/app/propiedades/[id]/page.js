'use client'

import { useState, useEffect } from 'react'
import { getPropertyById } from '../../../services/propertyService'
import PropertyDetail from '../../../components/PropertyDetail/PropertyDetail'

export default function PropertyPage({ params }) {
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true)
        const id = params.id
        console.log('Loading property:', id)
        
        const data = await getPropertyById(id)
        console.log('Property loaded:', data)
        setProperty(data)
      } catch (err) {
        console.error('Error loading property:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [params.id])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '70vh',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f1f5f9',
          borderTopColor: '#00815c',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#64748b' }}>Cargando propiedad...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '70vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Error al cargar la propiedad</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error}</p>
        <a 
          href="/propiedades"
          style={{
            padding: '12px 24px',
            background: '#00815c',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          Volver a Propiedades
        </a>
      </div>
    )
  }

  if (!property) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '70vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#64748b', marginBottom: '1rem' }}>Propiedad no encontrada</h2>
        <a 
          href="/propiedades"
          style={{
            padding: '12px 24px',
            background: '#00815c',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          Volver a Propiedades
        </a>
      </div>
    )
  }

  return <PropertyDetail property={property} />
}
