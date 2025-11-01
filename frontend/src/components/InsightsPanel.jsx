import { useEffect, useState } from 'react';

function InsightsPanel() {
  const [insight, setInsight] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/insights')
      .then(res => res.json())
      .then(data => {
        if (data && data.summary) {
          setInsight(data.summary);
        }
      });
  }, []);

  return (
    <div style={{
      backgroundColor: '#1e1e1e',
      padding: '1rem',
      borderRadius: '8px',
      marginTop: '2rem',
      maxWidth: '600px'
    }}>
      <h2 style={{ color: '#00bcd4' }}>Smart Insights</h2>
      <p style={{ marginTop: '0.5rem', lineHeight: '1.5' }}>
        {insight || 'Loading insights...'}
      </p>
    </div>
  );

}
export default InsightsPanel;