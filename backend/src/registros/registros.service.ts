import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Registro } from '../entities/registro.entity';
import { CreateRegistroDto } from '../dto/create-registro.dto';
import { UpdateRegistroDto } from '../dto/update-registro.dto';

@Injectable()
export class RegistrosService {
  constructor(
    @InjectRepository(Registro)
    private readonly registroRepository: Repository<Registro>,
  ) {}

  async create(createRegistroDto: CreateRegistroDto): Promise<Registro> {
    try {
      const registro = this.registroRepository.create(createRegistroDto);
      return await this.registroRepository.save(registro);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new ConflictException('E-mail já está em uso');
      }
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{
    data: Registro[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.registroRepository.createQueryBuilder('registro');

    if (search) {
      queryBuilder.where(
        '(registro.nome ILIKE :search OR registro.email ILIKE :search OR registro.mensagem ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('registro.dataCriacao', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Registro> {
    const registro = await this.registroRepository.findOne({ where: { id } });
    if (!registro) {
      throw new NotFoundException(`Registro com ID ${id} não encontrado`);
    }
    return registro;
  }

  async update(id: number, updateRegistroDto: UpdateRegistroDto): Promise<Registro> {
    const registro = await this.findOne(id);
    
    try {
      Object.assign(registro, updateRegistroDto);
      return await this.registroRepository.save(registro);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new ConflictException('E-mail já está em uso');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const registro = await this.findOne(id);
    await this.registroRepository.remove(registro);
  }

  async count(): Promise<number> {
    return await this.registroRepository.count();
  }
}
