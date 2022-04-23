import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Meet} from '../models';
import {ConversationRepository, MeetRepository} from '../repositories';

export class MeetController {
  constructor(
    @repository(MeetRepository)
    public meetRepository: MeetRepository,
    @repository(ConversationRepository)
    public conversationRepository: ConversationRepository,
  ) {}

  @post('/meets')
  @response(200, {
    description: 'Meet model instance',
    content: {'application/json': {schema: getModelSchemaRef(Meet)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Meet, {
            title: 'NewMeet',
            exclude: ['id'],
          }),
        },
      },
    })
    meet: Omit<Meet, 'id'>,
  ): Promise<any> {
    const currentMeet = await this.meetRepository.findOne({
      where: {
        or: [{usersIds: meet.usersIds}, {usersIds: meet.usersIds.reverse()}],
      },
    });
    if (currentMeet) {
      await this.meetRepository.updateById(currentMeet.id, {matched: true});
      await this.conversationRepository.create({meetId: currentMeet.id});
      return {matched: true};
    }
    return this.meetRepository.create(meet);
  }

  @get('/meets/count')
  @response(200, {
    description: 'Meet model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Meet) where?: Where<Meet>): Promise<Count> {
    return this.meetRepository.count(where);
  }

  @get('/meets')
  @response(200, {
    description: 'Array of Meet model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Meet, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Meet) filter?: Filter<Meet>): Promise<Meet[]> {
    return this.meetRepository.find(filter);
  }

  @patch('/meets')
  @response(200, {
    description: 'Meet PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Meet, {partial: true}),
        },
      },
    })
    meet: Meet,
    @param.where(Meet) where?: Where<Meet>,
  ): Promise<Count> {
    return this.meetRepository.updateAll(meet, where);
  }

  @get('/meets/{id}')
  @response(200, {
    description: 'Meet model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Meet, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Meet, {exclude: 'where'}) filter?: FilterExcludingWhere<Meet>,
  ): Promise<Meet> {
    return this.meetRepository.findById(id, filter);
  }

  @patch('/meets/{id}')
  @response(204, {
    description: 'Meet PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Meet, {partial: true}),
        },
      },
    })
    meet: Meet,
  ): Promise<void> {
    await this.meetRepository.updateById(id, meet);
  }

  @put('/meets/{id}')
  @response(204, {
    description: 'Meet PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() meet: Meet,
  ): Promise<void> {
    await this.meetRepository.replaceById(id, meet);
  }

  @del('/meets/{id}')
  @response(204, {
    description: 'Meet DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.meetRepository.deleteById(id);
  }
}
