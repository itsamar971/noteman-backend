async function test() {
  const url = 'http://localhost:5001/api/resources/search?resourceType=formulas';
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
test();
