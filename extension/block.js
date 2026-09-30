const domain = new URLSearchParams(location.search).get('domain',);
const message = {
  parent_blocklist: 'This website is blocked by your parent\'s safety policy.',
  api_unreachable: 'We couldn\'t verify this website right now, so it\'s blocked as a precaution.',
};
const reason = new URLSearchParams(location.search).get('reason', 'parent_blocklist');
document.querySelector('#domain').textContent = domain || 'Unknown domain';
document.querySelector('#back').addEventListener('click', () => history.back());
document.querySelector('#message').textContent = message[reason] || 'Blocked by parent';