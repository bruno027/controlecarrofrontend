import React, { useState, useEffect } from 'react';
import { setupAPIClient } from "../../services/api";
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './Combustivel.css';

const CombustivelPage = () => {
  const apiClient = setupAPIClient();

  const [combustiveis, setCombustiveis] = useState([]);
  const [carros, setCarros] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroDataInicial, setFiltroDataInicial] = useState('');
  const [filtroDataFinal, setFiltroDataFinal] = useState('');
  const [filtroPlaca, setFiltroPlaca] = useState('1000');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKmInicial, setModalKmInicial] = useState('');
  const [modalKmFinal, setModalKmFinal] = useState('');
  const [modalData, setModalData] = useState('');
  const [modalPlaca,setModalPlaca] = useState('');
  const [modalLitros,setModalLitros] = useState('');

  const [selectedCombustivel, setSelectedCombustivel] = useState(null);


  useEffect(() => {
    if(filtroDataInicial == ''){
      mesAtual();
  }
    filterCombustiveis();
    fetchCarros();
  }, []);

  useEffect(() => {
    filterCombustiveis();
  }, [currentPage, filtroDataInicial, filtroDataFinal, filtroPlaca]);

  /*
  const fetchCombustiveis = async () => {
    try {
      const response = await apiClient.get('/combustivel/todos');
      setCombustiveis(response.data);
    } catch (error) {
      console.error('Erro ao buscar despesas: ', error);
    }
  };*/


  const mesAtual = async() =>{
    const currentDate = new Date();
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);

    const formattedFirstDay = format(firstDayOfMonth, 'yyyy-MM-dd', { locale: ptBR });
    const formattedLastDay = format(lastDayOfMonth, 'yyyy-MM-dd', { locale: ptBR });
    setFiltroDataInicial(formattedFirstDay);
    setFiltroDataFinal(formattedLastDay);

  }
  const fetchCarros = async () => {
    try {
      const response = await apiClient.get('/api/carro');
      setCarros(response.data);
    } catch (error) {
      console.error('Erro ao buscar carros: ', error);
    }
  };

  const handleCadastrarCombustivel = async () => {
    try {
        //console.log("inicial: "+modalKmInicial+" km_final: "+modalKmFinal+ " carro_id: "+modalPlaca+" data: "+modalData)
      await apiClient.post("/combustivel", {
        km_inicial:parseInt(modalKmInicial),
        km_final:parseInt(modalKmFinal),
        carro_id:parseInt(modalPlaca),
        litros:parseFloat(modalLitros),
        data:modalData+"T14:00:00Z",
        user_id:1,
        
      });
      filterCombustiveis();
      setModalKmInicial("");
      setModalKmFinal("");
      setModalPlaca("");
      setModalData("");
      setModalOpen(false);

    } catch (error) {
      alert("Erro ao cadastrar combustível."+error);
    }
  };

  const filterCombustiveis = async () => {
    try {
      const params = {
        dataInicial: filtroDataInicial,
        dataFinal: filtroDataFinal,
        carro_id: filtroPlaca,
      };
      const response = await apiClient.get('/combustivel/filtro', { params });
      setCombustiveis(response.data);
      setTotalPages(1);
    } catch (error) {
      console.error('Erro ao filtrar combustivel: ', error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };



  const renderCombustiveis = () => {
    return combustiveis.map((combustivel) => (
      <tr key={combustivel.id}>
        <td>{combustivel.id}</td>
        <td>{combustivel.km_inicial}</td>
        <td>{combustivel.km_final}</td>
        <td>{combustivel.carro.placa}</td>
        <td>{combustivel.litros}</td>
        <td>{format(parseISO(combustivel.data.split("T")[0]), 'dd/MM/yyyy')}</td>
        <td>
          <button className='btn' onClick={() => handleEditCombustivel(combustivel)}>Alterar</button>
        </td>
        
      </tr>
    ));
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`page-button ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };


  const handleEditCombustivel = (combustivel) => {
    setSelectedCombustivel(combustivel);
  };

  const handleCloseEditModal = () => {
    setSelectedCombustivel(null);
  };

  const handleUpdateCombustivel = async () => {
    try {
      
      await apiClient.put(`/combustivel/${selectedCombustivel.id}`, {
        km_inicial: parseFloat(selectedCombustivel.km_inicial),
        km_final: parseFloat(selectedCombustivel.km_final),
        carro_id: parseInt(selectedCombustivel.carro_id),
        litros:parseFloat(selectedCombustivel.litros),
        data:selectedCombustivel.data.split("T")[0]+"T00:00:00.000Z",
      });

      filterCombustiveis();
      handleCloseEditModal();
    } catch (error) {
      console.error("Erro ao atualizar combustível:", error);
      alert("Ocorreu um erro ao atualizar o combustível. Por favor, tente novamente.");
    }
  };

  const handleDeleteCombustivel = async () => {
    if (window.confirm('Tem certeza de que deseja excluir este combustível?')) {
      try {
        await apiClient.delete(`/combustivel/${selectedCombustivel.id}`);
        filterCombustiveis();
        handleCloseEditModal();
      } catch (error) {
        console.error("Erro ao excluir combustível:", error);
        alert("Ocorreu um erro ao excluir o combustível. Por favor, tente novamente.");
      }
    }
  };



  return (
    <div className="despesa-page">
      <button className="add-button" onClick={handleModalOpen}>
        Adicionar Combustivel
      </button>
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
                
                <div className="filter-item">
                <label>Placa do Carro:</label>
                <select value={filtroPlaca} onChange={(e) => setFiltroPlaca(e.target.value)}>
                    <option value="1000" key="1000">Todos</option>
                    {carros.map((carro) => (
                    <option key={carro.id} value={carro.id}>
                        {carro.placa}
                    </option>
                    ))}
                </select>
                </div>
                
            </div>


      <table className="despesa-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Km inicial</th>
            <th>Km final</th>
            <th>Placa</th>
            <th>Litros</th>
            <th>Data</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>{renderCombustiveis()}</tbody>
      </table>
      {selectedCombustivel && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editar Combustivel</h2>
            <form>
              <div className="form-group">
                <label>Km inicial:</label>
                <input
                  type="number"
                  value={selectedCombustivel.km_inicial}
                  onChange={(e) => setSelectedCombustivel({...selectedCombustivel, km_inicial: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Km final:</label>
                <input
                  type="number"
                  value={selectedCombustivel.km_final}
                  onChange={(e) => setSelectedCombustivel({...selectedCombustivel, km_final: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Data:</label>
                <input
                  type="date"
                  value={format(parseISO(selectedCombustivel.data.split("T")[0]), "yyyy-MM-dd")}
                  onChange={(e) => setSelectedCombustivel({...selectedCombustivel, data: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Litros:</label>
                <input
                  type="number"
                  value={selectedCombustivel.litros}
                  onChange={(e) => setSelectedCombustivel({...selectedCombustivel, litros: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Placa do Carro:</label>
                <select
                  value={selectedCombustivel.carro_id}
                  onChange={(e) => setSelectedCombustivel({...selectedCombustivel, carro_id: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  {carros.map((carro) => (
                    <option key={carro.id} value={carro.id}>
                      {carro.placa}
                    </option>
                  ))}
                </select>
              </div>

              <button type="button" style={{background:"green"}} onClick={handleUpdateCombustivel}>Alterar</button>
              <button type="button" style={{background:"red"}} onClick={handleDeleteCombustivel}>Excluir</button>
              <button type="button" onClick={handleCloseEditModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      <div className="pagination">{renderPagination()}</div>

     

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Cadastrar Combustivel</h2>
            <form>
              
             
              <div className="form-group">
                <label>Data:</label>
                <input
                  type="date"
                  value={modalData}
                  onChange={(e) => setModalData(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Km inicial:</label>
                <input
                  type="text"
                  value={modalKmInicial}
                  onChange={(e) => setModalKmInicial(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Km final:</label>
                <input
                  type="text"
                  value={modalKmFinal}
                  onChange={(e) => setModalKmFinal(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Litros:</label>
                <input
                  type="number"
                  value={modalLitros}
                  onChange={(e) => setModalLitros(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Placa do Carro:</label>
                <select value={modalPlaca} onChange={(e) => setModalPlaca(e.target.value)}>
                  <option value="">Selecione...</option>
                  {carros.map((carro) => (
                    <option key={carro.id} value={carro.id}>
                      {carro.placa}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" onClick={handleCadastrarCombustivel}>Cadastrar</button>
              <button type="button" onClick={handleModalClose}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombustivelPage;