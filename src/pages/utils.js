export const addLabel = (label) => {
  const span = document.createElement('span');
  span.innerHTML = label;
  span.style.color = 'green';
  document.body.appendChild(span);
};

export const addHtml = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
};
