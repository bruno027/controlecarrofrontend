import React, { useState, useEffect } from 'react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './despesa.css';
import { setupAPIClient } from "../../services/api";

//<div className="total-registros">
//        <p>Total de registros: {despesas.length}</p>
 //       <p>Valor total: {formatCurrency(despesas.reduce((total, despesa) => total + despesa.valor, 0))}</p>
 //     </div>
const DespesaPage = () => {
  const apiClient = setupAPIClient();

  const [despesas, setDespesas] = useState([]);

  const [categoriasDespesa, setCategoriasDespesa] = useState([]);
  const [carros, setCarros] = useState([]);
  
  const [filtroDataInicial, setFiltroDataInicial] = useState('');
  const [filtroDataFinal, setFiltroDataFinal] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('1000');
  const [filtroPlaca, setFiltroPlaca] = useState('1000');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategoria, setModalCategoria] = useState('');
  const [modalPlaca, setModalPlaca] = useState('');
  const [modalData, setModalData] = useState('');
  const [modalValor, setModalValor] = useState('');
  const [modalDescricao, setModalDescricao] = useState('');
  const [selectedDespesa, setSelectedDespesa] = useState(null);

  useEffect(() => {
    if(filtroDataInicial == ''){
      mesAtual();
  }
    filterDespesas();
    fetchCategoriasDespesa();
    fetchCarros();
  }, []);

  useEffect(() => {
    filterDespesas();
  }, [filtroDataInicial, filtroDataFinal, filtroCategoria, filtroPlaca]);
/*
  const fetchDespesas = async () => {
    try {
      const response = await apiClient.get('/api/despesa/todas');
      setDespesas(response.data);
    } catch (error) {
      console.error('Erro ao buscar despesas: ', error);
    }
  };
*/
  const mesAtual = async() =>{
    const currentDate = new Date();
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);

    const formattedFirstDay = format(firstDayOfMonth, 'yyyy-MM-dd', { locale: ptBR });
    const formattedLastDay = format(lastDayOfMonth, 'yyyy-MM-dd', { locale: ptBR });
    setFiltroDataInicial(formattedFirstDay);
    setFiltroDataFinal(formattedLastDay);

  }

  const fetchCategoriasDespesa = async () => {
    try {
      const response = await apiClient.get('/categoriasdespesa/todas');
      setCategoriasDespesa(response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias de despesa: ', error);
    }
  };

  const fetchCarros = async () => {
    try {
      const response = await apiClient.get('/api/carro');
      setCarros(response.data);
    } catch (error) {
      console.error('Erro ao buscar carros: ', error);
    }
  };

  const handleCadastrarDespesa = async () => {
    try {
      await apiClient.post("/despesa", {
        categoria_despesa_id:parseInt(modalCategoria),
        valor:parseFloat(modalValor),
        carro_id:parseInt(modalPlaca),
        data:modalData+"T14:00:00Z",
        descricao:modalDescricao,
        user_id:1,
        
      });
      filterDespesas();
      setModalCategoria("");
      setModalPlaca("");
      setModalValor("");
      setModalData("");
      setModalDescricao("");
    } catch (error) {
      alert("Erro ao cadastrar combustível.");
    }
  };
  

  const filterDespesas = async () => {
    console.log("filtroCategoria "+ filtroCategoria+ " filtroPlaca "+ filtroPlaca);
    try {
      const params = {
        dataInicial: filtroDataInicial,
        dataFinal: filtroDataFinal,
        idCategoriaDespesa: filtroCategoria,
        idCarro: filtroPlaca,
      };
      const response = await apiClient.get('/api/despesa/filtro', { params });
      setDespesas(response.data);
    } catch (error) {
      console.error('Erro ao filtrar despesas: ', error);
    }
  };


  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    
    setModalOpen(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const renderDespesas = () => {
    return despesas.map((despesa) => (
      <tr key={despesa.id}>
        <td>{despesa.id}</td>
        <td>{despesa.categoria_despesa.nome}</td>
        <td>{despesa.carro.placa}</td>
        <td>{format(parseISO(despesa.data.split("T")[0]), 'dd/MM/yyyy')}</td>
        <td>{formatCurrency(despesa.valor)}</td>
        <td>{despesa.descricao}</td>
        <td>
          <button className="btn" onClick={() => handleEditDespesa(despesa)}>Alterar</button>
        </td>
        
      </tr>
    ));
  };



  const handleUpdateDespesa = async () => {
    try {
     
      // Envie a solicitação de atualização para o backend
      await apiClient.put(`/despesa/${selectedDespesa.id}`, {
        valor: parseFloat(selectedDespesa.valor),
        descricao: selectedDespesa.descricao,
        carro_id: parseInt(selectedDespesa.carro_id),
        categoria_despesa_id: parseInt(selectedDespesa.categoria_despesa_id),
        data: selectedDespesa.data.split("T")[0]+"T00:00:00.000Z",
      });

      filterDespesas();
      handleCloseEditModal();
    } catch (error) {
      console.error("Erro ao atualizar despesa:", error);
      alert("Ocorreu um erro ao atualizar o despesa. Por favor, tente novamente.");
    }
  };

  const handleDeleteDespesa = async () => {
    if (window.confirm('Tem certeza de que deseja excluir esta despesa?')) {
      try {
        await apiClient.delete(`/despesa/${selectedDespesa.id}`);
        filterDespesas();
        handleCloseEditModal();
      } catch (error) {
        console.error("Erro ao excluir despesa:", error);
        alert("Ocorreu um erro ao excluir a despesa. Por favor, tente novamente.");
      }
    }
  };

  const handleEditDespesa = (despesa) => {
    setSelectedDespesa(despesa);
  };

  const handleCloseEditModal = () => {
    setSelectedDespesa(null);
  };
  return (
    <div className="despesa-page">
      <button className="add-button" onClick={handleModalOpen}>
        Adicionar Despesa
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
          <label>Categoria Despesa:</label>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="1000" key="1000">Todos</option>
            {categoriasDespesa.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
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
            <th>Despesa</th>
            <th>Placa</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Descricao</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>{renderDespesas()}</tbody>
      </table>

            
      

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Cadastrar Despesa</h2>
            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label>Categoria Despesa:</label>
                <select
                  value={modalCategoria}
                  onChange={(e) => setModalCategoria(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {categoriasDespesa.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
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
              <div className="form-group">
                <label>Data:</label>
                <input
                  type="date"
                  value={modalData}
                  onChange={(e) => setModalData(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Valor:</label>
                <input
                  type="text"
                  value={modalValor}
                  onChange={(e) => setModalValor(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Descricao:</label>
                <input
                  type="text"
                  value={modalDescricao}
                  onChange={(e) => setModalDescricao(e.target.value)}
                />
              </div>

              <button type="submit" onClick={handleCadastrarDespesa}>Cadastrar</button>
              <button type="button" onClick={handleModalClose}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {selectedDespesa && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editar Despesa</h2>
            <form>

              <div className="form-group">
                <label>Categoria:</label>
                <select
                  value={selectedDespesa.categoria_despesa_id}
                  onChange={(e) => setSelectedDespesa({...selectedDespesa, categoria_despesa_id: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  {categoriasDespesa.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Valor:</label>
                <input
                  type="text"
                  value={selectedDespesa.valor}
                  onChange={(e) => setSelectedDespesa({...selectedDespesa, valor: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  value={selectedDespesa.descricao}
                  onChange={(e) => setSelectedDespesa({...selectedDespesa, descricao: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Data:</label>
                <input
                  type="date"
                  value={format(parseISO(selectedDespesa.data.split("T")[0]), 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDespesa({...selectedDespesa, data: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Placa do Carro:</label>
                <select
                  value={selectedDespesa.carro_id}
                  onChange={(e) => setSelectedDespesa({...selectedDespesa, carro_id: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  {carros.map((carro) => (
                    <option key={carro.id} value={carro.id}>
                      {carro.placa}
                    </option>
                  ))}
                </select>
              </div>

              <button type="button" style={{background:"green"}} onClick={handleUpdateDespesa}>Alterar</button>
              <button type="button" style={{background:"red"}} onClick={handleDeleteDespesa}>Excluir</button>
              <button type="button" onClick={handleCloseEditModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DespesaPage;