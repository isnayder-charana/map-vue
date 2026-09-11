export const createPlacePopupContent = (text: string, placeName: string): HTMLDivElement => {
  const container = document.createElement('div')

  const title = document.createElement('h4')
  title.textContent = text

  const description = document.createElement('p')
  description.textContent = placeName

  container.append(title, description)

  return container
}
