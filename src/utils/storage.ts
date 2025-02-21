// localstorage存储
export const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
}

export const getStorage = (key: string) => {
  if(localStorage.getItem(key) === 'undefined'){
    return ''
  }
  if (!localStorage.getItem(key)) return null;
  return JSON.parse(localStorage.getItem(key) || '');
}

export const removeStorage = (key: string) => {
  localStorage.removeItem(key);
}