import axios from 'axios';

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const response = await axios.post('http://localhost/api/auth/login', req.body);
      res.status(200).json(response.data);
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
