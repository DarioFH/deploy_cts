import React, { useState, useEffect } from 'react'
import './App.css'
import { apiService, Registro, CreateRegistroData } from './services/api'

interface FormData {
  nome: string
  email: string
  mensagem: string
}

interface FormErrors {
  nome?: string
  email?: string
  mensagem?: string
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    mensagem: ''
  })
  
  const [registros, setRegistros] = useState<Registro[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string>('')
  
  const registrosPorPagina = 10

  // Carregar registros do backend
  const loadRegistros = async () => {
    setIsLoading(true)
    setApiError('')
    
    try {
      const response = await apiService.getRegistros(
        paginaAtual,
        registrosPorPagina,
        searchTerm
      )
      setRegistros(response.data)
      setTotalRegistros(response.total)
      console.log('Registros carregados do backend:', response.data.length, 'de', response.total)
    } catch (error) {
      console.error('Erro ao carregar registros:', error)
      setApiError(error instanceof Error ? error.message : 'Erro ao carregar registros')
      setRegistros([])
      setTotalRegistros(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar registros quando a página ou busca mudar
  useEffect(() => {
    loadRegistros()
  }, [paginaAtual, searchTerm])

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    } else if (formData.nome.trim().length < 5) {
      newErrors.nome = 'Nome deve ter pelo menos 5 caracteres'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail deve ser válido'
    }

    if (!formData.mensagem.trim()) {
      newErrors.mensagem = 'Mensagem é obrigatória'
    } else if (formData.mensagem.trim().length < 3) {
      newErrors.mensagem = 'Mensagem deve ter pelo menos 3 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
    
    // Limpar erro da API
    if (apiError) {
      setApiError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setApiError('')

    try {
      const novoRegistroData: CreateRegistroData = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        mensagem: formData.mensagem.trim()
      }

      const novoRegistro = await apiService.createRegistro(novoRegistroData)
      console.log('Registro criado no backend:', novoRegistro)
      
      // Limpar formulário
      setFormData({ nome: '', email: '', mensagem: '' })
      setErrors({})
      
      // Recarregar a lista (voltar para primeira página)
      setPaginaAtual(1)
      await loadRegistros()
      
    } catch (error) {
      console.error('Erro ao criar registro:', error)
      setApiError(error instanceof Error ? error.message : 'Erro ao criar registro')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPaginaAtual(1) // Reset para primeira página ao buscar
  }

  const paginar = (numeroPagina: number) => {
    setPaginaAtual(numeroPagina)
  }

  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina)

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>Gerenciamento de Registros</h1>
      </header>

      {/* Formulário */}
      <div className="form-card">
        <h2>Adicionar Novo Registro</h2>
        <form onSubmit={handleSubmit} className="form">
          {apiError && (
            <div className="api-error">
              {apiError}
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Digite o nome"
                className={errors.nome ? 'error' : ''}
                disabled={isSubmitting}
                required
              />
              {errors.nome && <span className="error-message">{errors.nome}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Digite o e-mail"
                className={errors.email ? 'error' : ''}
                disabled={isSubmitting}
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group message-group">
              <label htmlFor="mensagem">Mensagem</label>
              <textarea
                id="mensagem"
                name="mensagem"
                value={formData.mensagem}
                onChange={handleInputChange}
                placeholder="Digite sua mensagem"
                rows={4}
                className={errors.mensagem ? 'error' : ''}
                disabled={isSubmitting}
                required
              />
              {errors.mensagem && <span className="error-message">{errors.mensagem}</span>}
            </div>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar Registro'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="list-card">
        <div className="list-header">
          <h2>Lista de Registros ({totalRegistros})</h2>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        {isLoading ? (
          <div className="loading">
            Carregando registros do backend...
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Mensagem</th>
                    <th>Data de Criação</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.length > 0 ? (
                    registros.map((registro) => (
                      <tr key={registro.id}>
                        <td>{registro.id}</td>
                        <td>{registro.nome}</td>
                        <td>{registro.email}</td>
                        <td>{registro.mensagem}</td>
                        <td>{new Date(registro.dataCriacao).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="no-data">
                        {searchTerm ? 'Nenhum registro encontrado para a busca' : 'Nenhum registro cadastrado ainda'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPaginas > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => paginar(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                >
                  Anterior
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                  <button
                    key={numero}
                    className={`pagination-btn ${paginaAtual === numero ? 'active' : ''}`}
                    onClick={() => paginar(numero)}
                  >
                    {numero}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  onClick={() => paginar(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                >
                  Próximo
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App