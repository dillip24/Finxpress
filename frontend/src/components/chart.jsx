import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
  } from 'chart.js';
  import { Line } from 'react-chartjs-2';
  

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
  
  export default function Chart(props) {
    return <Line {...props} />;
  }