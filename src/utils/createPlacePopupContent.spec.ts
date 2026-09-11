import { describe, expect, it } from 'vitest'
import { createPlacePopupContent } from './createPlacePopupContent'

describe('createPlacePopupContent', () => {
  it('crea contenido de texto seguro para el popup', () => {
    const content = createPlacePopupContent('<img src=x onerror="alert(1)">', 'Tacna, Perú')

    expect(content.querySelector('h4')?.textContent).toBe('<img src=x onerror="alert(1)">')
    expect(content.querySelector('p')?.textContent).toBe('Tacna, Perú')

    // Confirma que el texto no fue convertido en una etiqueta real.
    expect(content.querySelector('img')).toBeNull()
  })
})
