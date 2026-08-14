import http from 'k6/http';
import { check } from 'k6';

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
const token = __ENV.TEST_AUTH_TOKEN;

if (!token) {
  throw new Error('Defina TEST_AUTH_TOKEN no arquivo .env antes de executar o teste.');
}

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const response = http.get(`${baseUrl}/api/sprints`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { endpoint: 'list-sprints' },
  });

  check(response, {
    'lista de sprints responde 200': (response) => response.status === 200,
    'lista contém ao menos uma sprint': (response) => response.json().length > 0,
  });
}
