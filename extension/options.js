const apiUrl = document.querySelector('#apiUrl'); //from op.js
const deviceToken = document.querySelector('#deviceToken');
const status = document.querySelector('#status');

chrome.storage.local.get({ apiUrl: 'http://localhost:4000', deviceToken: '' }).then((savedstuff) => {
  apiUrl.value = savedstuff.apiUrl;
  deviceToken.value = savedstuff.deviceToken;
});//this means only read and give back the saved values earlier

document.querySelector('#save').addEventListener('click', async () => {
  const normalizedApiUrl = apiUrl.value.trim().replace(/\/$/, '');
  const token = deviceToken.value.trim();
  if (!normalizedApiUrl || !token) {
    status.textContent = 'Enter both the API URL and device token.';
    return;
  }
  await chrome.storage.local.set({ apiUrl: normalizedApiUrl, deviceToken: token, cache: {} });
  status.textContent = 'Settings saved.';
});
