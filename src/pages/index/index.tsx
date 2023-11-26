import { useEffect } from 'react';
import { getZDStocks } from '@/services/iwencai';
import './index.less';

export default function HomePage() {

  useEffect(() => {
    getZDStocks('2023.11.24').then(console.log);
  }, []);

  return (
    <div className="index-container">
      
    </div>
  );
}
