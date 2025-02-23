export const postRequest = async (url: string, body: object) => {
  return await fetch(`/api${url}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  })
}

export const getRequest = async (url: string) => {
  return await fetch(`/api${url}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

/**
 * Returns RGBA color code for given string.
 * @param {string} str
 * @returns {string}
 */
export const stringToColorRgbaCode = (str: string) => {
  if (!str) {
    str = ''
  }
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const r = (hash >> 16) & 0xff
  const g = (hash >> 8) & 0xff
  const b = hash & 0xff

  return `rgba(${r}, ${g}, ${b}, 0.5)`
}
