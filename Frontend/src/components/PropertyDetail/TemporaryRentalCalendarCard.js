'use client'

import React, { useMemo, useState } from 'react'
import {
  FaChevronLeft,
  FaChevronRight,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaShare
} from 'react-icons/fa'
import './TemporaryRentalCalendarCard.css'

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const parseISODate = (value) => {
  if (!value || typeof value !== 'string') return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const stripTime = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const isSameDay = (a, b) => Boolean(a) && Boolean(b) && a.getTime() === b.getTime()

const formatShortDate = (date) => {
  if (!date) return null
  const day = date.getDate()
  const month = date.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')
  return `${day} ${month.charAt(0).toUpperCase()}${month.slice(1)}`
}

const formatMonthLabel = (date) => {
  const label = date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function TemporaryRentalCalendarCard({
  property,
  whatsappHref,
  whatsappNumber,
  onEmailClick,
  onShare,
  idCopied,
  onCopyId
}) {
  const today = stripTime(new Date())
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)

  const occupiedRanges = useMemo(() => {
    const occupation = Array.isArray(property?.occupation) ? property.occupation : []
    return occupation
      .map((entry) => ({ from: parseISODate(entry?.from), to: parseISODate(entry?.to) }))
      .filter((range) => range.from && range.to)
  }, [property?.occupation])

  const isDateOccupied = (date) =>
    occupiedRanges.some((range) => date >= range.from && date <= range.to)

  const isDatePast = (date) => date < today

  const monthCells = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = (firstDay.getDay() + 6) % 7 // lunes = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < startOffset; i += 1) cells.push(null)
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [viewDate])

  const isPrevDisabled =
    viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth()

  const goPrevMonth = () => {
    if (isPrevDisabled) return
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goNextMonth = () => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))

  const hasOccupiedBetween = (from, to) => {
    const cursor = new Date(from)
    while (cursor <= to) {
      if (isDateOccupied(cursor)) return true
      cursor.setDate(cursor.getDate() + 1)
    }
    return false
  }

  const handleDayClick = (date) => {
    if (!date || isDatePast(date) || isDateOccupied(date)) return

    if (!rangeStart || rangeEnd || date < rangeStart) {
      setRangeStart(date)
      setRangeEnd(null)
      return
    }

    if (isSameDay(date, rangeStart)) {
      setRangeStart(null)
      setRangeEnd(null)
      return
    }

    if (hasOccupiedBetween(rangeStart, date)) {
      setRangeStart(date)
      setRangeEnd(null)
      return
    }

    setRangeEnd(date)
  }

  const getDayClassName = (date) => {
    const classes = ['calendar-day']
    if (isSameDay(date, today)) classes.push('is-today')
    if (isDatePast(date)) classes.push('is-past')
    if (isDateOccupied(date)) classes.push('is-occupied')
    if (isSameDay(date, rangeStart)) classes.push('is-range-start')
    if (isSameDay(date, rangeEnd)) classes.push('is-range-end')
    if (rangeStart && rangeEnd && date > rangeStart && date < rangeEnd) classes.push('is-in-range')
    return classes.join(' ')
  }

  const handleCheckAvailability = () => {
    if (!rangeStart || !rangeEnd) return

    const propertyTitle = property?.publication_title || property?.address || 'esta propiedad'
    const propertyUrl = `https://www.silviafernandezpropiedades.com.ar/propiedad/${property?.id}`
    const message = `Hola, quiero consultar disponibilidad para "${propertyTitle}" del ${formatShortDate(rangeStart)} al ${formatShortDate(rangeEnd)}.\n\n${propertyUrl}`
    const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="temp-rental-card">
      <div className="temp-rental-calendar">
        <div className="calendar-nav">
          <button
            type="button"
            className="calendar-nav-btn"
            onClick={goPrevMonth}
            disabled={isPrevDisabled}
            aria-label="Mes anterior"
          >
            <FaChevronLeft />
          </button>
          <span className="calendar-month-label">{formatMonthLabel(viewDate)}</span>
          <button
            type="button"
            className="calendar-nav-btn"
            onClick={goNextMonth}
            aria-label="Mes siguiente"
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="calendar-weekdays">
          {WEEKDAYS.map((weekday, index) => (
            <span key={`${weekday}-${index}`}>{weekday}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {monthCells.map((date, index) => {
            if (!date) return <span key={`empty-${index}`} className="calendar-day is-empty" />
            const disabled = isDatePast(date) || isDateOccupied(date)
            return (
              <button
                type="button"
                key={date.toISOString()}
                className={getDayClassName(date)}
                disabled={disabled}
                onClick={() => handleDayClick(date)}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="button"
        className="temp-rental-check-btn"
        disabled={!rangeStart || !rangeEnd}
        onClick={handleCheckAvailability}
      >
        {rangeStart && rangeEnd
          ? `Consultar: ${formatShortDate(rangeStart)} → ${formatShortDate(rangeEnd)}`
          : 'Consultar disponibilidad'}
      </button>

      <div className="temp-rental-contact-row">
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="temp-contact-btn whatsapp">
          <FaWhatsapp />
          <span>WhatsApp</span>
        </a>
        <a href="tel:+5492216006474" className="temp-contact-btn phone">
          <FaPhone />
          <span>Llamar</span>
        </a>
        <button type="button" className="temp-contact-btn email" onClick={onEmailClick}>
          <FaEnvelope />
          <span>Email</span>
        </button>
      </div>

      <button type="button" className="temp-rental-share-btn" onClick={onShare}>
        <FaShare />
        Compartir propiedad
      </button>

      <button
        type="button"
        className={`temp-rental-id-btn${idCopied ? ' copied' : ''}`}
        onClick={onCopyId}
        title="Copiar ID"
      >
        {idCopied ? '¡ID copiado!' : `ID #${property.id}`}
      </button>
    </div>
  )
}
