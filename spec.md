# Dental Plus

## Current State
El proyecto tiene la estructura base de Caffeine (frontend React + backend Motoko) pero sin componentes ni código de aplicación implementados.

## Requested Changes (Diff)

### Add
- Página de ventas completa para DENTAL PLUS
- Sección Hero con contador de cupos limitados y CTA de reserva
- Sección de servicios dentales ofrecidos
- Galería de fotos (imágenes de muestra del consultorio)
- Sección de testimonios de pacientes
- Formulario de reserva de cita (nombre, teléfono, servicio, mensaje)
- Sección de información de contacto y horario
- Backend para almacenar reservas y gestionar cupos disponibles

### Modify
- App.tsx para renderizar la página de ventas completa

### Remove
- Nada

## Implementation Plan

1. Generar backend Motoko con:
   - Tipo `Reservation` (nombre, teléfono, servicio, mensaje, fecha)
   - Variable mutable `availableSlots` (cupos disponibles, por defecto 10)
   - Función `makeReservation` para crear reserva y decrementar cupos
   - Función `getAvailableSlots` para consultar cupos
   - Función `getReservations` (solo admin)

2. Frontend con secciones:
   - Navbar con logo y CTA
   - Hero: nombre clínica, slogan, contador de cupos, botón reservar
   - Servicios: tarjetas de servicios dentales
   - Galería: grid de fotos
   - Testimonios: tarjetas con citas de pacientes
   - Reserva: formulario conectado al backend
   - Contacto: dirección, teléfono, horario 24h
   - Footer

### Info del negocio
- Nombre: DENTAL PLUS
- Dirección: Jr Callao 474 / Av. Perú Cdra 35, San Martín de Porres, Perú
- Teléfono: +51 954 857 715
- Horario: Abierto las 24 horas
