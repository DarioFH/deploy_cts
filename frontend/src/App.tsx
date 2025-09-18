import React, { useState, useEffect } from 'react'
import './App.css'

interface FormData {
  nome: string
  email: string
  mensagem: string
}

interface Registro {
  id: number
  nome: string
  email: string
  mensagem: string
  dataCriacao: string
}

interface FormErrors {
  nome?: string
  email?: string
  mensagem?: string
}

function App() {
  console.log('App component rendering...')
  
  // URL da API a partir da variável de ambiente
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  console.log('Using API URL:', API_URL)
  
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    mensagem: ''
  })
  
  const [registros, setRegistros] = useState<Registro[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const registrosPorPagina = 10

  // Carregar registros do backend
  const loadRegistros = async () => {
    console.log('Loading registros from backend...')
    setIsLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/registros`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Backend response:', data)
      setRegistros(data.data || [])
    } catch (error) {
      console.error('Error loading registros:', error)
      setRegistros([])
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar registros quando a página ou busca mudar
  useEffect(() => {
    console.log('useEffect triggered - loading registros')
    loadRegistros()
  }, [paginaAtual, searchTerm])

  // Refresh automático de 10 em 10 segundos
  useEffect(() => {
    console.log('Setting up auto-refresh every 10 seconds')
    
    const interval = setInterval(() => {
      console.log('Auto-refresh: loading registros...')
      loadRegistros()
    }, 10000) // 10 segundos

    // Cleanup do interval quando o componente for desmontado
    return () => {
      console.log('Cleaning up auto-refresh interval')
      clearInterval(interval)
    }
  }, []) // Array vazio para executar apenas uma vez

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
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/registros`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome.trim(),
          email: formData.email.trim(),
          mensagem: formData.mensagem.trim()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const novoRegistro = await response.json()
      console.log('Registro criado:', novoRegistro)
      
      setFormData({ nome: '', email: '', mensagem: '' })
      setErrors({})
      
      // Recarregar a lista
      await loadRegistros()
      
    } catch (error) {
      console.error('Erro ao criar registro:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const registrosFiltrados = registros.filter(registro =>
    registro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registro.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registro.mensagem.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const indiceUltimoRegistro = paginaAtual * registrosPorPagina
  const indicePrimeiroRegistro = indiceUltimoRegistro - registrosPorPagina
  const registrosAtuais = registrosFiltrados.slice(indicePrimeiroRegistro, indiceUltimoRegistro)
  const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina)

  const paginar = (numeroPagina: number) => {
    setPaginaAtual(numeroPagina)
  }

  console.log('Rendering with', registros.length, 'registros')

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
          <h2>Lista de Registros ({registrosFiltrados.length})</h2>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                  {registrosAtuais.length > 0 ? (
                    registrosAtuais.map((registro) => (
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