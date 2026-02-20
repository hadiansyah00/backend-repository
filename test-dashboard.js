async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password'
      })
    });
    
    const loginData = await loginRes.json();
    if (!loginData.token) {
       console.error("Login failed:", loginData);
       return;
    }
    const token = loginData.token;
    
    const statsRes = await fetch('http://localhost:5000/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const statsData = await statsRes.json();
    console.log("Status Code:", statsRes.status);
    console.log(JSON.stringify(statsData, null, 2));
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
test();
