export const addLabel = (label: string) => {
  const span = document.createElement('span');
  span.innerHTML = label;
  span.style.color = 'green';
  document.body.appendChild(span);
};

export const addHtml = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
};

export function toArray<T>(arr: T | T[]): T[] {
  if (!arr) return [];
  if (Array.isArray(arr)) return arr;
  return [arr];
}