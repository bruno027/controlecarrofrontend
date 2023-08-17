import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import './Dashboard.css';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

import { ptBR } from 'date-fns/locale';
import { setupAPIClient } from "../../services/api";

function Dashboard() {
  const apiClient = setupAPIClient();
  const [despesas, setDespesas] = useState([]);

  const [combustiveis, setCombustiveis] = useState([]);
  const [totalPlacas, setTotalPlacas] = useState([]);
  const [totalCategorias, setTotalCategorias] = useState([]);
  const [selectedPlacaData, setSelectedPlacaData] = useState(null);
  const [selectedCategoriaData,setSelectedCategoriaData] = useState(null);
  const [selectedCombustivelData,setSelectedCombustivelData] = useState(null);

  const [filtroDataInicial, setFiltroDataInicial] = useState('');
  const [filtroDataFinal, setFiltroDataFinal] = useState('');

  const [data, setData] = useState([]);


  useEffect(() => {
    if(filtroDataInicial == ''){
        mesAtual();
    }
    
    filterDespesas();
    filterCombustivel();
    filterTotalPlaca();
    filterTotalCategoria();
    fetchData();
  }, []);

  useEffect(()=>{
    filterDespesas();
    filterCombustivel();
    filterTotalPlaca();
    filterTotalCategoria();
  },[filtroDataInicial,filtroDataFinal])



  const fetchData = async () => {
    try {
      const response = await apiClient.get('/api/despesas/mes'); // Endpoint para obter os valores totais dos últimos 6 meses
      setData(response.data);
    } catch (error) {
      console.error('Erro ao obter os dados:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  const mesAtual = async() =>{
    const currentDate = new Date();
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);

    const formattedFirstDay = format(firstDayOfMonth, 'yyyy-MM-dd', { locale: ptBR });
    const formattedLastDay = format(lastDayOfMonth, 'yyyy-MM-dd', { locale: ptBR });
    setFiltroDataInicial(formattedFirstDay);
    setFiltroDataFinal(formattedLastDay);

  }

  
 
  const filterDespesas = async () => {
    
    try {
      const params = {
        dataInicial: filtroDataInicial,
        dataFinal: filtroDataFinal,
        idCategoriaDespesa: 1000,
        idCarro: 1000,
      };
      const response = await apiClient.get('/api/despesa/filtro', { params });
      setDespesas(response.data);
    } catch (error) {
      console.error('Erro ao filtrar despesas: ', error);
    }
  };

  const filterCombustivel = async () => {
    
    try {
      const params = {
        dataInicial: filtroDataInicial,
        dataFinal: filtroDataFinal,
        carro_id: 1000,
      };
      const response = await apiClient.get('/combustivel/filtro', { params });
      setCombustiveis(response.data);
    } catch (error) {
      console.error('Erro ao filtrar combustivel: ', error);
    }
  };
  function getKmRodadosPorCarro(combustiveis) {
    const kmRodadosPorCarro = {};
    
    combustiveis.forEach((combustivel) => {
      const placa = combustivel.carro.placa;
      const kmTotal = combustivel.km_final - combustivel.km_inicial;
      const litros = combustivel.litros;
      
      if (kmRodadosPorCarro[placa]) {
        kmRodadosPorCarro[placa].kmTotal += kmTotal;
        kmRodadosPorCarro[placa].litrosTotal += litros;
        kmRodadosPorCarro[placa].quantidade += 1;
      } else {
        kmRodadosPorCarro[placa] = { kmTotal, litrosTotal: litros, quantidade: 1 };
      }
    });
  
    return Object.entries(kmRodadosPorCarro).map(([placa, values]) => ({
      placa,
      litros: (values.kmTotal / values.litrosTotal).toFixed(2),
      kmTotal: values.kmTotal,
      abastecido: values.litrosTotal,
    }));
  }
  const filterTotalPlaca = async () => {
    
    try {
      const params = {
        dataInicial: filtroDataInicial,
        dataFinal: filtroDataFinal,
      };
      const response = await apiClient.get('/api/despesa/carro/total', { params });
      setTotalPlacas(response.data);
    } catch (error) {
      console.error('Erro ao filtrar total carro placas despesas: ', error);
    }
  };

  const getGastosPorCategoria = (despesas) => {
    const gastosPorCategoria = {};
  
    despesas.forEach((despesa) => {
      const categoriaNome = despesa.categoria_despesa.nome;
      const valor = despesa.valor;
  
      if (gastosPorCategoria[categoriaNome]) {
        gastosPorCategoria[categoriaNome] += valor;
      } else {
        gastosPorCategoria[categoriaNome] = valor;
      }
    });
  
    return gastosPorCategoria;
  };

  const filterTotalCategoria = async () => {
    
    try {
      const params = {
        dataInicial: filtroDataInicial,
        dataFinal: filtroDataFinal,
      };
      const response = await apiClient.get('/api/despesa/categoria/total', { params });
      setTotalCategorias(response.data);
      
    } catch (error) {
      console.error('Erro ao filtrar total categoria despesas: ', error);
    }
  };

  const getGastosPorPlaca = (despesas) => {
    const gastosPorPlaca = {};
    despesas.forEach((despesa) => {
      const placa = despesa.carro.placa;
      if (gastosPorPlaca[placa]) {
        gastosPorPlaca[placa] += despesa.valor;
      } else {
        gastosPorPlaca[placa] = despesa.valor;
      }
    });
    return gastosPorPlaca;
  }

  const handleBarClick = async (data) => {
    setSelectedPlacaData(data);

  };



  const handleClosePopup = () => {
    setSelectedPlacaData(null);
  };


  const handleCategoriaClick = async(data) => {
    setSelectedCategoriaData(data);
    
  }

  const handleCombustivelClick = async(data) => {
    setSelectedCombustivelData(data);
    
  }


  const handleCloseCategoriaPopup = () =>{
    setSelectedCategoriaData(null);
  }

  const handleCloseCombustivelPopup = () =>{
    setSelectedCombustivelData(null);
  }
  
  

  return (
    <div className="app">
      <h1>DashBoard</h1>
      <div className="filters">
        <div className="filter-item">
          <label>Data Inicial:</label>
          <input
            type="date"
            value={filtroDataInicial}
            onChange={(e) => setFiltroDataInicial(e.target.value)}
          />
        </div>
        <div className="filter-item">
          <label>Data Final:</label>
          <input
            type="date"
            value={filtroDataFinal}
            onChange={(e) => setFiltroDataFinal(e.target.value)}
          />
        </div>

      </div>

      <div className="cards-container">
        <Card title="Gasto total" description={'Valor total: ' + formatCurrency(despesas.reduce((total, despesa) => total + despesa.valor, 0))} />
        <Card title="Total rodado" description={'' + (combustiveis.reduce((km_final, combustivel) => km_final + combustivel.km_final, 0)) - (combustiveis.reduce((km_inicial, combustivel) => km_inicial + combustivel.km_inicial, 0))+"KM"} />
      </div>

      <div className="grafico-container">
        <div className="grafico">
          <h2>Gastos por Placa</h2>

          <ResponsiveContainer width="100%" height={300}>
              <BarChart data={totalPlacas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="placa" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valorTotal" fill="#008000" onClick={handleBarClick} />
              </BarChart>
          </ResponsiveContainer>
        </div>

        
        {selectedPlacaData && (
            

            <div className="popup">
            <h2>Informações da Placa</h2>
            <p><strong>Placa:</strong> {selectedPlacaData.placa}</p>
            <p><strong>Valor:</strong> R${selectedPlacaData.valorTotal}</p>
            
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={Object.entries(getGastosPorCategoria(selectedPlacaData.despesas))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="0" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="1" fill="#8884d8" name="Valor Total" />
              </BarChart>
            </ResponsiveContainer>
            <div className='scrollable-table'>
            <table className="despesa-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>Custo</th>
                  <th>Descricao</th>                       
                </tr>
              </thead>
              <tbody>
              {selectedPlacaData.despesas.map((despesa) => (                           
                <tr>
                  <td>{format(new Date(despesa.data), 'dd/MM/yyyy')}</td>
                  <td>{despesa.categoria_despesa.nome}</td>
                  <td>R$ {despesa.valor}</td>
                  <td>{despesa.descricao}</td>
                </tr>
                  
            ))}
                </tbody>
              </table>
            </div>
            
                
            <button onClick={handleClosePopup}>Fechar</button>
          </div>
        )}
        <div className="grafico">
          <h2>Gastos por Categoria</h2>

          <ResponsiveContainer width="100%" height={300}>
              <BarChart data={totalCategorias} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" fill="#008000" onClick={handleCategoriaClick} />
              </BarChart>
          </ResponsiveContainer>
        </div>
        
        {selectedCategoriaData && (
            

            <div className="popup">
            <h2>Informações categoria</h2>
            <p><strong>Categoria:</strong> {selectedCategoriaData.nome}</p>
            <p><strong>Valor:</strong> R${selectedCategoriaData.valor}</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={Object.entries(getGastosPorPlaca(selectedCategoriaData.despesas))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="0" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="1" fill="#8884d8" name="Valor Total" />
              </BarChart>
            </ResponsiveContainer>
            <div className='scrollable-table'>
              <table className="despesa-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Placa</th>
                    <th>Custo</th>
                    <th>Descricao</th>                       
                  </tr>
                </thead>
                <tbody>
                {selectedCategoriaData.despesas.map((despesa) => (                           
                  <tr>
                    <td>{format(new Date(despesa.data), 'dd/MM/yyyy')}</td>
                    <td>{despesa.carro.placa}</td>
                    <td>R$ {despesa.valor}</td>
                    <td>{despesa.descricao}</td>
                  </tr>
                    
              ))}
                </tbody>
              </table>
            </div>
            
        
            <button onClick={handleCloseCategoriaPopup}>Fechar</button>
          </div>
        )}

        
      </div>
      <br/>
      
      <div className='grafico-container'>
        <div className="grafico">
          <h2>Media km/l</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getKmRodadosPorCarro(combustiveis)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="placa" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="litros" fill="#008000" onClick={handleCombustivelClick}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {selectedCombustivelData && (
          <div className="popup">
            <h2>Informações utilização combustivel</h2>
            <p><strong>KM:</strong> {selectedCombustivelData.kmTotal}</p>
            <p><strong>Litros</strong>{selectedCombustivelData.abastecido}</p>
            <p><strong>Media km/l:</strong> {selectedCombustivelData.litros}</p>
            <button onClick={handleCloseCombustivelPopup}>Fechar</button>
          </div>

        )}
      
        <div className="grafico">
          <h2>Total de Gastos Mensais</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#008000" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
      </div>
      

    
    </div>
  );
}

export default Dashboard;
