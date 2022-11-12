export const xfetch = {
  get(url, options = {}) {
    const requestOptions = {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      method: "GET",
    };
    return fetch(url, requestOptions).then(handleResponse);
  },
  post(url, body, options = {}) {
    const requestOptions = {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      body: JSON.stringify(body),
      method: "POST",
    };
    return fetch(url, requestOptions).then(handleResponse);
  },
  put(url, body, options = {}) {
    const requestOptions = {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      body: JSON.stringify(body),
      method: "PUT",
    };
    return fetch(url, requestOptions).then(handleResponse);
  },
  delete(url, options = {}) {
    const requestOptions = {
      method: "DELETE",
      ...options,
    };
    return fetch(url, requestOptions).then(handleResponse);
  },
};

async function handleResponse(response) {
  if (response.ok) {
    return await response.json();
  } else {
    let data = await response.text();

    try {
      data = JSON.parse(data);
      if (data.error) data = data.error;
    } catch (e) {
      // ignore
    }

    return Promise.reject(
      new Error(data || response.statusText || response.status)
    );
  }
}
