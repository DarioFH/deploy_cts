# Dockerfile para PostgreSQL com credenciais básicas
FROM postgres:15-alpine

# Definir credenciais básicas através de variáveis de ambiente
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=password123
ENV POSTGRES_DB=app_db

# Expor a porta padrão do PostgreSQL
EXPOSE 5432

# Comando padrão do PostgreSQL (já definido na imagem base)
CMD ["postgres"]
