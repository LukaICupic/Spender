export const postRequest = async (url: string, body: object) => {
  return await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  })
}

export const getRequest = async (url: string) => {
  return await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}
